const faceapi = require("face-api.js");
const canvas = require("canvas");
const {createCanvas , loadImage} = require('canvas');
const {Canvas , Image , ImageData} = canvas;
faceapi.env.monkeyPatch({Canvas , Image , ImageData});
const userService = require("../services/user-service.js");
const User = require("../Models/user-model.js");


class Attendance {
    async register(req , res){
        try {
            const {name , rollNumber , image} = req.body;
            if (!name || !rollNumber || !image){
                return res.json({
                    success : false ,
                    message : "name , rollNumber and image are required"
                });
            }
            
            let user = await userService.findUser({rollNumber});

            if (user){
                return res.json({
                    success : false ,
                    message : "User is already registered"
                })
            }
            
            user = await User.findOneAndUpdate({rollNumber} , {faceId : image} , {new : true});

            return res.json({
                success : true ,
                message : "Your face has been successfly added to our database"
            });           

        } catch (error) {
            console.log(error);
            return res.json({
                success : false ,
                message : "Error in registration"
            });
        }
    }

    async login(req , res){
        try {
            const {rollNumber , image} = req.body;
            if (!rollNumber || !image){
                return res.json({
                    success : false ,
                    message : "Roll number and image are required"
                });
            }

            const img = await loadImage(image);
            const canvas = createCanvas(img.width , img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img , 0 , 0 , img.width , img.height);

            const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withFaceDescriptors();
            console.log(detections);

            if (!detections.length){
                return res.json({
                    success : false ,
                    message : "No face detected"
                })
            }

            
            const user = await userService.findUser({rollNumber});

            if (!user){
                return res.json({
                    success : false ,
                    message : "User does not exist"
                });
            }

            const storedImage = user.faceId;

            const storedImg = await loadImage(storedImage); // It will convert base64 image into image object that can be drawn on canvas
            const storedCanvas = createCanvas(storedImg.width , storedImg.height); // It will create a virtual canvas which is of same lenght of image stored
            const storedCtx = storedCanvas.getContext('2d'); // It is used to get the reference of 
            storedCtx.drawImage(storedImg , 0 , 0 , storedImg.width , storedImg.height); // It is used to draw image

            // storedImg -> it is used to draw the storedImage, giving reference
            // (0 , 0) -> It provides the information that from where image should be drawn
            

            // It runs all models on stored image
            const storedImageDetections = await faceapi.detectSingleFace(storedCanvas).withFaceLandmarks().withFaceDescriptor();

            // detectSingleFace -> it is used to the single face from stored Image
            // withFaceLandMarks -> It is used to extract the facial landmarks (eg:- nose , eyes , lips , etc)
            // withFaceDescriptor -> Extracts a unique numerical representation of face


            const storedDescriptor = storedImageDetections.descriptor;
            const faceMatcher = new faceapi.FaceMatcher(storedDescriptor);
            const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);

            if (bestMatch.label === 'unknown'){
                console.log("Face not recognized");
                return res.json({
                    success : false ,
                    message : "Face not recognized"
                })
            }

        } catch (error) {
            return res.json({
                success : false ,
                error
            })
        }
    }
}


module.exports = new Attendance();