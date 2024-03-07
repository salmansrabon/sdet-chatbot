const axios = require('axios');
const fs = require('fs');

const apiKey = process.env.OPENAI_API_KEY;

async function callAPI1(question) {
    try {
        const response = await axios.post('http://localhost:3000/chat', { question });
        return response.data.message;
    } catch (error) {
        console.error('Error calling API 1:', error);
        throw error;
    }
}

async function imageBotResponse(req) {
    try {
        const filePath = req.file.path;
        const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        };

        const payload = {
            "model": "gpt-4-vision-preview",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "summarise what is in this image"
                        },
                        {
                            "type": "image_url",
                            "image_url": `data:image/jpeg;base64,${base64Image}`
                        }
                    ]
                }
            ],
            "max_tokens": 300
        };

        const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, { headers });
        return response.data.choices[0].message;
    } catch (error) {
        console.error('Error processing the image:', error);
        throw error;
    }
}

async function aiBotResponse(req, res) {
    const { question } = req.body;

    try {
        let response;
        let imageResponse;

        if (req.file) {
            imageResponse = await imageBotResponse(req);
        }

        if (!imageResponse) {
            response = await callAPI1(question);
        } else {
            response = await callAPI1("This is the image details: " + imageResponse.content + "\nThis is user question regarding the image: \n" + question);
            console.log(imageResponse.content);
            console.log(question);
        }

        res.json({ response });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { aiBotResponse };
