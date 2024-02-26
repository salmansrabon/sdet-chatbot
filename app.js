const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//const chatRoutes = require('./sdetBot.js');
const chatbotRoutes = require('./routes/sdetbot.route.js');


app.use(bodyParser.json());
app.use('/', chatbotRoutes);



module.exports = app;