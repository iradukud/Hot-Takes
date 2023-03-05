const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const messageController = require("../controllers/messages");

//messages routes 
router.post("/send", upload.single("messageImage"), messageController.sendMessage);



module.exports = router;