const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const userService = require("../services/user-service.js");
const UserDto = require("../dtos/user-dtos.js");
const emailService = require("../services/email-service.js");
const User = require('../Models/user-model.js');
const Leaderboard = require("../Models/leaderboard-modal.js")

class AuthController {
  async registerStudent(req, res) {
    console.log("➡️ Path: AuthController.registerStudent - Body size:", Object.keys(req.body).length);
    try {
      const { name, rollNumber, year, branch, programme, email, password, role } = req.body;

      if (!name || !rollNumber || !year || !branch || !programme || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      // Check if email already exists
      const existingUser = await userService.findUser({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "User already registered" });
      }

      // profile picture is handled by upload middleware (multer-storage-cloudinary)
      let profilePictureUrl = "";
      if (req.file) {
        // req.file.path is the URL provided by CloudinaryStorage
        profilePictureUrl = req.file.path;
        console.log("📸 Profile picture uploaded to:", profilePictureUrl);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      const student = await userService.createUser({
        name,
        rollNumber,
        year,
        branch,
        programme,
        email,
        profilePicture: profilePictureUrl,
        password: hashedPassword,
        role: role || "user", // Default is user
      });

      try {
        await Leaderboard.create({user:student._id, score:100});
        console.log("🏆 Leaderboard entry created for user:", student._id);
        
        const leaderboard = await Leaderboard.find().populate("user", "name rollNumber branch year").sort({score : -1});
        const io = req.app.get("io");
        if (io) {
          io.emit("leaderboard-update", leaderboard);
        } else {
          console.warn("⚠️ Socket.io instance not found on req.app");
        }
      } catch (leaderboardError) {
        console.error("❌ Error during leaderboard/socket sync:", leaderboardError);
      }

      // Generate token
      const token = jwt.sign(
        { id: student._id, role: student.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        message: "Student registered successfully",
        token,
        user: new UserDto(student, token),
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  }

  async loginStudent(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const user = await userService.findUser({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role || "user" },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: new UserDto(user, token),
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  }

  async  promotion(req, res) {
    try {
      // 1. Destructure email from the request body
      const { email } = req.body;
  
      // 2. Validate that an email was provided
      if (!email) {
        console.log("Validation Error: Email is required.");
        return res.status(400).json({ // 400 Bad Request
          success: false,
          message: "Email is required to promote a user."
        });
      }
  
      // 3. Find the user in the database by their email
      //    Using 'User.findOne' which is common with Mongoose/MongoDB
      const userToPromote = await User.findOne({ email: email });
  
      // 4. Handle the case where the user does not exist
      if (!userToPromote) {
        console.log(`Not Found: User with email ${email} not found.`);
        return res.status(404).json({ // 404 Not Found
          success: false,
          message: `User with email ${email} was not found.`
        });
      }
  
      // 5. Check if the user is already an admin
      if (userToPromote.role === 'admin') {
        console.log(`Conflict: User ${email} is already an admin.`);
        return res.status(409).json({ // 409 Conflict
          success: false,
          message: "This user is already an admin."
        });
      }
  
      // 6. Update the user's role to 'admin'
      userToPromote.role = 'admin';
  
      // 7. Save the updated user object back to the database
      await userToPromote.save();
  
      console.log(`Success: User ${email} has been promoted to admin.`);
      await emailService.sendAdminPromotionEmail(userToPromote);
      // 8. Send a success response with the updated user data
      return res.status(200).json({ // 200 OK
        success: true,
        message: "User successfully promoted to admin.",
        user: {
          id: userToPromote._id,
          name: userToPromote.name,
          email: userToPromote.email,
          role: userToPromote.role
        }
      });
    } catch (error) {
      // Catch any unexpected errors (e.g., database connection issues)
      console.error("Server Error during promotion:", error);
      return res.status(500).json({ // 500 Internal Server Error
        success: false,
        message: "An unexpected error occurred on the server.",
        error: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email and new password are required."
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User with email ${email} not found.`
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      console.log(`Success: Password for user ${email} has been changed by superAdmin.`);
      
      return res.status(200).json({
        success: true,
        message: "Password successfully changed."
      });

    } catch (error) {
      console.error("Server Error during password change:", error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred on the server.",
        error: error.message
      });
    }
  }

  async countAllUsers(req, res){
    try {
      const users = await userService.countAllUsers();
      return res.json({
        success : true,
        users
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success : false,
        error : error.message
      })
    }
  }

  async getUser(req, res){
    try {
      const {id} = req.params;
      const user = await userService.getUser(id);
      // console.log(user);
      if (!user) return res.json({
        success : false,
        message : "No information available for this user"
      });

      return res.json({
        success : true,
        user
      });
    }
    catch(err){
      console.log(err);
      return res.json({
        success : false,
        err
      });
    }
  }

  async logout(req, res) {
    try {
      // Since we're using JWT tokens stored in localStorage (stateless),
      // the actual logout is handled on the frontend by clearing localStorage
      // This endpoint serves as a confirmation and can be extended for token blacklisting
      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.error("Logout Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
