const faceapi = require('face-api.js');
const fs = require('fs');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

// Configure face-api.js to use canvas in Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = './models'; // Adjust if your models folder is in a different location

// Load the models needed for face detection and recognition
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
}

// Load an image from a file
async function loadImage(filePath) {
    const img = await canvas.loadImage(filePath);
    return img;
}

// Compare faces in two images
async function compareFaces(imagePath1, imagePath2) {
    const img1 = await loadImage(imagePath1);
    const img2 = await loadImage(imagePath2);

    const detections1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const detections2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

    if (!detections1 || !detections2) {
        console.log('One of the images does not contain a face.');
        return;
    }

    const distance = faceapi.euclideanDistance(detections1.descriptor, detections2.descriptor);
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
    await loadModels();
    
    // Specify the paths to your images
    const imagePath1 = 'image-1.jpg'; // Update this path
    const imagePath2 = 'image-4.jpeg'; // Update this path

    await compareFaces(imagePath1, imagePath2);
}

// Run the face comparison
main().catch(err => console.error(err));
