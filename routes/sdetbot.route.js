const express = require('express');
const { serverStatus, sdetBotResponse } = require('../controllers/chatbot.controller.js');

const router = express.Router();

router.get("/status", serverStatus);
router.post("/chat", sdetBotResponse);

module.exports = router;