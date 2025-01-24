const faceapi = require("face-api.js");
const loadModals = async()=> {
    const modelPath = "./public/models";
    Promise.all([faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath) , faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath) , (faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath))]);
}


module.exports = loadModals;