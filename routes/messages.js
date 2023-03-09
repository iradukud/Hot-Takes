const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messages");

/* messages routes */
//send message to user
router.post("/send", messageController.sendMessage);

module.exports = router;