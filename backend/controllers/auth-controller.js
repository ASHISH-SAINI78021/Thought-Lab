const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const userService = require("../services/user-service.js");
const UserDto = require("../dtos/user-dtos.js");

class AuthController {
  async registerStudent(req, res) {
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

      // Upload profile picture to Cloudinary if exists
      let profilePictureUrl = "";
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        profilePictureUrl = result.secure_url;
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
        { expiresIn: "7d" }
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
}

module.exports = new AuthController();
