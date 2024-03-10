const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Function to call API 1
async function callAPI1(question) {
    try {
        const response = await axios.post('http://localhost:3000/chat', { question });
        return response.data.message;
    } catch (error) {
        console.error('Error calling API 1:', error);
        throw error;
    }
}

async function callAPI2(imagePath) {
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        return response.data.content;
    } catch (error) {
        console.error('Error calling API 2:', error);
        throw error;
    }
}

// callAPI1('What is the capital of France?').then(console.log);
//callAPI2('./car.png').then(console.log);

async function handleRequest(question, imagePath) {
    try {
        if (imagePath && question) {
            let imageDetail = await callAPI2(imagePath);
            return await callAPI1("This is the image details: " + imageDetail + "\nThis is user question regarding the image: \n" + question);
        } else {
            return await callAPI1(question);
        }
    } catch (error) {
        console.error('Error handling request:', error);
        throw error;
    }
}

const question = "What do you know by Road to SDET?";
const imagePath = ""; // Set the path to the uploaded image if available, otherwise leave it as an empty string

handleRequest(question, imagePath)
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
