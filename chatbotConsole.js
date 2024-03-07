const { OpenAI } = require("openai");
const fs = require('fs').promises;
require('dotenv').config(); // Make sure to install dotenv if using .env for environment variables

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
            model: "gpt-4-vision-preview", // Ensure this matches the model you intend to use
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
        // Access the response correctly based on the structure of chat completions
        const lastMessage = response.choices[0].message.content.trim() // Assuming you want the last message in the response
        return lastMessage;
    } catch (e) {
        console.error(`An error occurred: ${e.response?.data?.error?.message || e.message}`);
        return `An error occurred: ${e.response?.data?.error?.message || e.message}`;
    }
}

async function runChatbot() {
    const story = await loadStory('./docs/story.txt');
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    async function saveFeedback(question, correctAnswer) {
        try {
            await fs.appendFile('./docs/feedback.txt', `${question} | ${correctAnswer}\n`, { encoding: 'utf8' });
        } catch (e) {
            console.error(`Error saving to feedback.txt: ${e}`);
        }
    }

    const askFeedback = async (userQuestion, answer) => {
        readline.question("Was this answer correct? (yes/no) \n", async (feedback) => {
            if (feedback.toLowerCase() === 'no') {
                readline.question("What is the correct answer? \n", async (correctAnswer) => {
                    await saveFeedback(userQuestion, correctAnswer);
                    console.log("Thank you for your feedback!\n");
                    askQuestion(); // Ask next question
                });
            } else {
                console.log("Thank you for confirming.\n");
                askQuestion(); // Ask next question
            }
        });
    };

    const askQuestion = () => {
        readline.question("What is your question? (Type 'quit' to exit) \n", async (userQuestion) => {
            if (userQuestion.toLowerCase() === 'quit') {
                readline.close();
                return;
            }

            const answer = await getAnswerFromGPT(userQuestion, story);
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

