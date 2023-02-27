const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


//Post Routes - simplified for now
//router.get("/:id", ensureAuth, postsController.getPost);

router.post("/create", upload.single("postImage"), postsController.createPost);
router.post("/addComment", upload.single("commentImage"), postsController.addComment);
router.post("/like", postsController.likePost);

router.put("/editPost", upload.single("postImage"), postsController.editPost);

router.delete("/deletePost", postsController.deletePost);

router.post("/searchPosts", postsController.searchPosts);


module.exports = router;