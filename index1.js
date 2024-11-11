const faceapi = require('face-api.js');
const fs = require('fs');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

// Configure face-api.js to use canvas in Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = './models'; // Adjust if your models folder is in a different location

// Load the models needed for face detection and recognition
async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_PATH);  // Use faster tinyFaceDetector
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
}

// Load and resize the image for faster processing
async function loadImage(filePath) {
    const img = await canvas.loadImage(filePath);
    const resizedImage = canvas.createCanvas(320, 240);  // Resize image to 320x240
    const context = resizedImage.getContext('2d');
    context.drawImage(img, 0, 0, 320, 240);
    return resizedImage;
}

// Compare faces in two images
async function compareFaces(imagePath1, imagePath2) {
    const img1 = await loadImage(imagePath1);
    const img2 = await loadImage(imagePath2);

    // Detect all faces using tinyFaceDetector for faster processing
    const detections1 = await faceapi.detectAllFaces(img1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    const detections2 = await faceapi.detectAllFaces(img2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

    console.log("detections1: ", detections1);
    console.log("detections2: ", detections2);


    if (!detections1.length || !detections2.length) {
        console.log('One of the images does not contain a face.');
        return;
    }

    const distance = faceapi.euclideanDistance(detections1[0].descriptor, detections2[0].descriptor);  // Compare first face
    const threshold = 0.6; // Set a threshold for face comparison

    console.log(`Distance between faces: ${distance}`);
    if (distance <= threshold) {
        console.log('The faces are the same.');
    } else {
        console.log('The faces are different.');
    }
}

// Main function to execute the comparison
async function main() {
    const t = new Date().getTime() / 1000;
    await loadModels();
    
    // Specify the paths to your images
    const imagePath1 = 'image-1.jpg'; // Update this path
    const imagePath2 = 'image-4.jpeg'; // Update this path

    await compareFaces(imagePath1, imagePath2);

    console.log("Time Taken - ", (new Date().getTime() / 1000) - t, "seconds")
}

// Run the face comparison
main().catch(err => console.error(err));
