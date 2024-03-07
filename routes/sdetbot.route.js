const express = require('express');
const { serverStatus, sdetBotResponse } = require('../controllers/chatbot.controller.js');
const { imageBotResponse } = require('../controllers/imagebot.controller.js');
const { aiBotResponse } = require('../controllers/askai.controller.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get("/status", serverStatus);
router.post("/chat", sdetBotResponse);
router.post('/upload', upload.single('image'), imageBotResponse)
router.post('/askai', upload.single('image'), aiBotResponse)
module.exports = router;