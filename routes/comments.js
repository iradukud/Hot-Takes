const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//comment routes
router.post("/add/:id", commentsController.addComment);

router.post("/edit/:id", commentsController.editComment);

router.get("/delete/:id", commentsController.deleteComment);




module.exports = router;