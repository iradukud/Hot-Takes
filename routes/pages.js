const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pages");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//pages routes 
router.get("/", pagesController.getIndex);
router.get("/homepage", ensureAuth, pagesController.getHome);
//router.get("/feed", ensureAuth, postsController.getFeed);

module.exports = router;