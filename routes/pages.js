const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pages");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//pages routes 
router.get("/", pagesController.getIndex);
router.get("/home", ensureAuth, pagesController.getHome);

router.post("/searchUsers", pagesController.searchUsers);

//router.get("/feed", ensureAuth, postsController.getFeed);

module.exports = router;