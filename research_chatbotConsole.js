const { OpenAI } = require("openai");
const fs = require('fs').promises;
require('dotenv').config(); // Make sure to install dotenv if using .env for environment variables

const openai = new OpenAI(process.env.OPENAI_API_KEY);


async function getAnswerFromGPT(question) {

    const prompt = `Question: ${question}\nAnswer:`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Ensure this matches the model you intend to use
            messages: [
                { "role": "system", "content": "You are very knowledgeble at human personal problems like family, sex, emotion etc. Give them possible solution for mental peace." },
                { "role": "user", "content": prompt }
            ],
            temperature: 0.5,
            max_tokens: 4096,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        });
        // Access the response correctly based on the structure of chat completions
        const lastMessage = response.choices[0].message.content.trim() // Assuming you want the last message in the response
        return lastMessage;
    } catch (e) {
        console.error(`An error occurred: ${e.response?.data?.error?.message || e.message}`);
        return `An error occurred: ${e.response?.data?.error?.message || e.message}`;
    }
}

async function runChatbot() {
    //const story = await loadStory('./docs/story.txt');
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = () => {
        readline.question("What is your question? (Type 'quit' to exit) \n", async (userQuestion) => {
            if (userQuestion.toLowerCase() === 'quit') {
                readline.close();
                return;
            }

            const answer = await getAnswerFromGPT(userQuestion);
            console.log(`${answer}\n`);

            // Check the MODE environment variable to decide whether to ask for feedback
            if (process.env.MODE === 'training') {
                await askFeedback(userQuestion, answer);
            } else {
                askQuestion(); // In production mode, just continue to the next question
            }
        });
    };
    askQuestion();
}

runChatbot();

