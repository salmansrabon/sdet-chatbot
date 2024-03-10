const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//const chatRoutes = require('./sdetBot.js');
const sdetbotRoutes = require('./routes/sdetbot.route.js');


app.use(bodyParser.json());
app.use('/', sdetbotRoutes);
module.exports = app;