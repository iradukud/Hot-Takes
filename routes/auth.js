const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");

//Main Routes - simplified for now
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.post("/signup", upload.single('profileImage'), authController.postSignup);

module.exports = router;
