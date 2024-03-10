const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// OpenAI API Key
const apiKey = process.env.OPENAI_API_KEY;

const imageBotResponse = async (req, res) => {
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

    res.json(response.data.choices[0].message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the image");
  } finally {
    fs.unlink(req.file.path, err => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
  }
};

module.exports = { imageBotResponse };
