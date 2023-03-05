const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messages");

//messages routes 
router.post("/send", messageController.sendMessage);



module.exports = router;