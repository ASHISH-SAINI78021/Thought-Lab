const faceapi = require("face-api.js");
const canvas = require("canvas");
const { createCanvas, loadImage } = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const ExcelJS = require("exceljs");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const userService = require("../services/user-service.js");
const User = require("../Models/user-model.js");
const path = require("path");
const fs = require("fs");

class Attendance {
    /**
     * Register a new student with face recognition
     */
    async register(req, res) {
        try {
            console.log("Request received with file:", req.file); // Debug log
    
            const { name, rollNumber } = req.body;
    
            if (!name || !rollNumber || !req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Name, roll number, and image are required",
                });
            }
    
            // Verify the file was uploaded to Cloudinary
            if (!req.file.path) {
                throw new Error("File upload failed - no Cloudinary URL returned");
            }
    
            console.log("Cloudinary URL:", req.file.path); // Debug log
    
            const user = await userService.findUser({ rollNumber });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
    
            // Process face detection
            const img = await loadImage(req.file.path);
            const userCanvas = createCanvas(img.width, img.height);
            const ctx = userCanvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
    
            const detection = await faceapi.detectSingleFace(userCanvas)
                .withFaceLandmarks()
                .withFaceDescriptor();
    
            if (!detection) {
                return res.status(400).json({
                    success: false,
                    message: "No face detected",
                });
            }
    
            // Update user record
            await User.findOneAndUpdate(
                { rollNumber },
                {
                    $set: {
                        faceId: [Array.from(detection.descriptor)],
                        imageUrl: req.file.path,
                        isFaceRegistered: true
                    }
                }
            );
    
            return res.status(200).json({
                success: true,
                message: "Registration successful",
                imageUrl: req.file.path
            });
    
        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Registration failed",
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Login a student using face recognition
     */
    async login(req, res) {
        try {
          const { rollNumber } = req.body;
      
          if (!rollNumber || !req.file) {
            return res.status(400).json({
              success: false,
              message: "Roll number and image are required"
            });
          }
      
          // Process uploaded image
          const img = await loadImage(req.file.path);
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width, img.height);
      
          // Face detection
          const detection = await faceapi.detectSingleFace(canvas)
            .withFaceLandmarks()
            .withFaceDescriptor();
      
          if (!detection) {
            return res.status(400).json({
              success: false,
              message: "No face detected"
            });
          }
      
          // Find user and compare faces
          const user = await User.findOne({ rollNumber });
          if (!user || !user.faceId) {
            return res.status(404).json({
              success: false,
              message: "User not found or no face registered"
            });
          }
      
          const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
            user.rollNumber,
            [new Float32Array(user.faceId[0])]
          );
          const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor]);
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      
          if (bestMatch.label === "unknown" || bestMatch.distance > 0.3) {
            return res.status(401).json({
              success: false,
              message: "Face recognition failed"
            });
          }
      
          // Prevent double-marking for the same date
          const now = new Date();
          const today = now.toISOString().split('T')[0];
          const alreadyMarked = (user.attendance || []).some(a => a.date === today);
          if (alreadyMarked) {
            return res.status(400).json({
              success: false,
              message: "Attendance already marked for today"
            });
          }
      
          // Record attendance on user
          const attendanceRecord = {
            date: today,
            time: now.toTimeString().split(' ')[0],
            status: "Present",
            imageUrl: req.file.path
          };
      
          user.attendance = user.attendance || [];
          user.attendance.push(attendanceRecord);
      
          // Persist attendance
          await user.save();
      
          // Update leaderboard atomically (add 10 points)
          const awardPoints = 10;
          const leaderboardEntry = await Leaderboard.findOneAndUpdate(
            { user: user._id },
            {
              $inc: { score: awardPoints },
              $setOnInsert: { user: user._id }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).populate('user', 'name rollNumber branch year');
      
          // Emit updated full leaderboard to connected clients (populated & sorted)
          const io = req.app.get('io');
          if (io) {
            const fullLeaderboard = await Leaderboard.find()
              .populate('user', 'name rollNumber branch year')
              .sort({ score: -1 });
            io.emit('leaderboard-update', fullLeaderboard);
          }
      
          // Return success (no leaderboard data or rank)
          return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
              name: user.name,
              rollNumber: user.rollNumber
            }
          });
      
        } catch (error) {
          console.error("Login error:", error);
          return res.status(500).json({
            success: false,
            message: "Login failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }
      

    async downloadAttendance(req, res) {
        try {
          console.log("Step 1: Fetching users...");
          const users = await userService.allUsers();
      
          const workbook = new ExcelJS.Workbook();
          const sheet = workbook.addWorksheet("Attendance");
      
          // Add columns
          sheet.columns = [
            { header: "Name", key: "name", width: 25 },
            { header: "Roll Number", key: "rollNumber", width: 20 },
            { header: "Date", key: "date", width: 15 },
            { header: "Time", key: "time", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "Image URL", key: "imageUrl", width: 40 },
          ];
      
          // Add data
          users.forEach((user) => {
            (user.attendance || []).forEach((att) => {
              sheet.addRow({
                name: user.name,
                rollNumber: user.rollNumber,
                date: att.date,
                time: att.time,
                status: att.status,
                imageUrl: att.loginImageUrl || user.profilePicture || "N/A"
              });
            });
          });
      
          // Style header row
          sheet.getRow(1).font = { bold: true };
      
          // Set response headers
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=attendance.xlsx"
          );
      
          console.log("Step 2: Writing Excel file to response...");
          await workbook.xlsx.write(res);
          
          console.log("Step 3: Ending response");
          res.end();
        } catch (error) {
          console.error("Excel generation failed:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to generate attendance sheet",
            error: error.message
          });
        }
      }
}

module.exports = new Attendance();