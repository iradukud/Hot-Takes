const express = require("express");
const router = express.Router();
const pagesController = require("../controllers/pages");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

/* pages routes */
//get login and sign-in page
router.get("/", pagesController.getIndex);
//get homepage
router.get("/home", ensureAuth, pagesController.getHome);
//get explore page
router.get("/explore", ensureAuth, pagesController.getExplore);
//get trending page
router.get("/trending", ensureAuth, pagesController.getTrending);
//get profile page
router.get("/profile/:id", ensureAuth, pagesController.getProfile);
//get message page
router.get("/message/:id", ensureAuth, pagesController.getMessage);
//search for users
router.post("/searchUsers", pagesController.searchUsers);
//search for posts
router.post("/searchPosts", pagesController.searchPosts);

module.exports = router;