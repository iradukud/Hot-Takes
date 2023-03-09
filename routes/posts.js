const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");

/* post routes */
//create new post
router.post("/create", upload.single("postImage"), postsController.createPost);

//get post page
router.get("/:id", postsController.getPost);

//edit post
router.put("/edit/:id", upload.single("postImage"), postsController.editPost);

//delete post
router.delete("/delete/:id", postsController.deletePost);

//like post
router.get("/like/:id", postsController.likePost);

module.exports = router;