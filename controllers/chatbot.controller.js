const { OpenAI } = require("openai");
const fs = require('fs').promises;
require('dotenv').config();

const serverStatus = (req, res) => {
    res.status(200).json({
        message: "Server is up"
    });
}

const sdetBotResponse=async (req, res)=>{
    const { question } = req.body;
    const story = await loadStory('./docs/story.txt');
    const answer = await getAnswerFromGPT(question, story);
    console.log(`${answer}\n`);
    res.status(200).json({
        message: answer
    });
}

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function loadStory(filename) {
    return fs.readFile(filename, { encoding: 'utf8' });
}
async function getAnswerFromFeedback(question) {
    try {
        const feedbackData = await fs.readFile('./docs/feedback.txt', { encoding: 'utf8' });
        const feedbackLines = feedbackData.split('\n');
        for (const line of feedbackLines) {
            const [storedQuestion, storedAnswer] = line.split('|').map(part => part.trim());
            if (storedQuestion.toLowerCase() === question.toLowerCase()) {
                return storedAnswer;
            }
        }
    } catch (e) {
        console.log("No feedback found or error reading feedback file.");
    }
    return null;
}
async function getAnswerFromGPT(question, story) {
    const feedbackAnswer = await getAnswerFromFeedback(question);
    if (feedbackAnswer) {
        return feedbackAnswer;
    }

    const prompt = `The following information is provided about the business:\n${story}\n\nQuestion: ${question}\nAnswer:`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are a knowledgeable assistant named SDET bot who provides information based on the provided business narrative and you should answer from the point of view of 'Our' instead of using the name Road to SDET in your response." },
                { "role": "user", "content": prompt }
            ],
            temperature: 0.5,
            max_tokens: 4096,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        });
        const lastMessage = response.choices[0].message.content.trim()
        return lastMessage;
    } catch (e) {
        console.error(`An error occurred: ${e.response?.data?.error?.message || e.message}`);
        return `An error occurred: ${e.response?.data?.error?.message || e.message}`;
    }
}

module.exports = { serverStatus, sdetBotResponse }
