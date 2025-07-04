const bcrypt = require("bcryptjs"); // for password hashing
const jwt = require("jsonwebtoken");
const userService = require("../services/user-service.js");
const UserDto = require("../dtos/user-dtos.js");

class AuthController {
  async registerStudent(req, res) {
    try {
      const { name, rollNumber, year, branch, programme, email, password } =
        req.body;
      const profilePicture = req.file?.filename || "";

      if (
        !name ||
        !rollNumber ||
        !year ||
        !branch ||
        !programme ||
        !email ||
        !profilePicture ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Check if email already exists
      const existingUser = await userService.findUser({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already registered",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to DB
      const student = await userService.createUser({
        name,
        rollNumber,
        year,
        branch,
        programme,
        email,
        profilePicture,
        password: hashedPassword,
      });


      res.status(201).json({
        success: true,
        message: "Student registered successfully",
        user: student,
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async loginStudent(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Find user by email
      const user = await userService.findUser({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.role || "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const userDto = new UserDto(user, token);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: userDto,
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
