require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const token = process.env.DISCORD_BOT_TOKEN;
const channelIds = process.env.CHANNEL_IDS.split(','); // Split the string into an array
const apiUrl = process.env.API_URL;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    // Check if the message was sent in one of the specific channels and mentions the bot
    // if (channelIds.includes(message.channel.id) && message.mentions.has(client.user)) {
        if ((message.channel.type === 'DM' || (channelIds.includes(message.channel.id) && message.mentions.has(client.user.id)))) {
        const question = message.content.replace(`<@!${client.user.id}>`, '').trim();

        try {
            const response = await axios.post(apiUrl, { question });
            if (response.data && response.data.message) {
                message.channel.send(response.data.message);
            } else {
                // Handle case where response does not have the expected format
                console.error('Unexpected response format:', response.data);
                message.channel.send('I received an unexpected response format from the API.');
            }
        } catch (error) {
            console.error('Error fetching response from API:', error);
            message.channel.send('An error occurred while fetching the response from the API.');
        }
    }
});

client.login(token);
