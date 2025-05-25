const faceapi = require("face-api.js");
const canvas = require("canvas");
const { createCanvas, loadImage } = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

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

            if (user) {
                console.log("User already exists");
                return res.status(400).json({
                    success: false,
                    message: "User is already registered",
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

            user = await User.create({
                name : "Ashish Saini",
                rollNumber : "12213075",
                year : 3,
                branch : "Information Technology",
                programme : "BTech",
                email : "ashu78021@gmail.com",
                phone : "9896022762",
                faceId: [faceDescriptor], // Store face descriptor
            });

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
    
            const user = await userService.findUser({ rollNumber });
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
    
            console.log("Login Successful");
            return res.status(200).json({
                success: true,
                message: "Login successful",
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Error during login",
            });
        }
    }
    
}

module.exports = new Attendance();
