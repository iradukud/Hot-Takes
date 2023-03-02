const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pages");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//pages routes 
router.get("/", pagesController.getIndex);
router.get("/home", ensureAuth, pagesController.getHome);
router.get("/explore", ensureAuth, pagesController.getExplore);
router.get("/trending", ensureAuth, pagesController.getTrending);
router.get("/profile/:id", ensureAuth, pagesController.getProfile);


router.post("/searchUsers", pagesController.searchUsers);
router.post("/searchPosts", pagesController.searchPosts);

//router.get("/feed", ensureAuth, postsController.getFeed);

module.exports = router;