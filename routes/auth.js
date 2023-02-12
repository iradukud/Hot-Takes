const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.post("/signup", authController.postSignup);

module.exports = router;
