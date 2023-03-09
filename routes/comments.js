const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

/* comment routes */
//add comment to post
router.post("/add/:id", commentsController.addComment);
//edit comment
router.post("/edit/:id", commentsController.editComment);
//delete comment
router.get("/delete/:id", commentsController.deleteComment);

module.exports = router;