const faceapi = require("face-api.js");
const canvas = require("canvas");
const { createCanvas, loadImage } = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const ExcelJS = require("exceljs");

const userService = require("../services/user-service.js");
const User = require("../Models/user-model.js");
const path = require("path");

class Attendance {
    /**
     * Register a new student with face recognition
     */
    async register(req, res) {
        try {
            const { name, rollNumber } = req.body;

            console.log("Name:", name);
            console.log("Roll Number:", rollNumber);

            if (!name || !rollNumber || !req.file) {
                console.log("All fields should be present");
                return res.status(400).json({
                    success: false,
                    message: "Name, roll number, and image are required",
                });
            }

            let user = await userService.findUser({ rollNumber });

            if (!user) {
                console.log("User not exist");
                return res.status(400).json({
                    success: false,
                    message: "User is not registered",
                });
            }

            console.log("Processing image for face descriptor...");
            const imagePath = path.join(__dirname, "../storage", req.file.filename);
            const img = await loadImage(imagePath);
            const userCanvas = createCanvas(img.width, img.height);
            const ctx = userCanvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const detection = await faceapi.detectSingleFace(userCanvas)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                console.log("No face detected");
                return res.status(400).json({
                    success: false,
                    message: "No face detected in the image",
                });
            }

            const faceDescriptor = Array.from(detection.descriptor);

            user = await User.findOneAndUpdate(
                { rollNumber: rollNumber }, // filter
                {
                  $set: {
                    faceId: [faceDescriptor]
                  }
                },
                { new: true } // return the updated document
              );

            console.log("Student registered successfully");
            return res.status(201).json({
                success: true,
                message: "Face successfully registered in the database",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Error in registration",
            });
        }
    }

    /**
     * Login a student using face recognition
     */
    async login(req, res) {
        try {
            console.log("Step 1: Received request");
    
            const { rollNumber } = req.body;
            if (!rollNumber || !req.file) {
                console.log("Step 2: Missing rollNumber or image");
                return res.status(400).json({ success: false, message: "Roll number and image are required" });
            }
    
            const imagePath = path.join(__dirname, "../storage", req.file.filename);
            console.log("Step 3: Image Path:", imagePath);
    
            const img = await loadImage(imagePath);
            console.log("Step 4: Image Loaded");
    
            const userCanvas = createCanvas(img.width, img.height);
            console.log("Step 5: Canvas Created");
    
            const ctx = userCanvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            console.log("Step 6: Image Drawn on Canvas");
    
            const detections = await faceapi.detectSingleFace(userCanvas)
                .withFaceLandmarks()
                .withFaceDescriptor();
            console.log("Step 7: Face Detection Results", detections);

    
            if (!detections) {
                console.log("Step 8: No face detected");
                return res.status(400).json({ success: false, message: "No face detected" });
            }

            console.log(rollNumber)
    
            const user = await userService.findUser({ rollNumber });
            console.log(user);
            if (!user || !user.faceId) {
                console.log("Step 9: User not found or no face data stored");
                return res.status(400).json({ success: false, message: "User not found or no registered face" });
            }
            console.log("Step 9: User Found", user);
    
            // Convert stored descriptor to Float32Array and check length
            console.log("FaceId length : " , user.faceId[0].length);
            if (user.faceId[0].length !== 128) {
                console.error("Stored face descriptor length is not 128:", user.faceId.length);
                return res.status(400).json({ success: false, message: "User face data is corrupted" });
            }


            // console.log(user.faceId);

            // if (!user.faceId || user.faceId.some(isNaN)) {
            //     console.error("Invalid face descriptor: Contains NaN values");
            //     return res.status(400).json({ success: false, message: "Face data is corrupted" });
            // }
            
            const storedDescriptor = new Float32Array(user.faceId[0]);
    
            console.log("Step 10: Comparing face descriptors" , storedDescriptor);
            console.log("Detected descriptor length:", detections.descriptor.length);
            console.log("Stored descriptor length:", storedDescriptor);
    
            // Create a LabeledFaceDescriptors object
            const labeledDescriptor = new faceapi.LabeledFaceDescriptors(user.rollNumber, [storedDescriptor]);

            console.log("Labeled Descriptor" , labeledDescriptor);

            const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor]);
    
            const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
            console.log("Best Match:", bestMatch);
    
            if (bestMatch.label === "unknown") {
                console.log("Face not recognized");
                return res.status(401).json({
                    success: false,
                    message: "Face not recognized",
                });
            }

            if (bestMatch._distance <= 0.3){
                console.log("Attendance Mark Successfully");

                const now = new Date();
                const date = now.toISOString().split("T")[0];
                const time = now.toTimeString().split(" ")[0];

                user.attendance.push({
                    date : date,
                    time : time,
                    status : "Present"
                });

                await user.save();

                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                });
            }
            else {
                console.log("Face not matched");
                return res.status(200).json({
                    success: false,
                    message: "Login Failed",
                });
            }
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Error during login",
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
