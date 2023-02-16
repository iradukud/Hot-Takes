const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");

module.exports = {
  createPost: async (req, res) => {
    try {
      console.log(req.body)
      let result = ''
      // Upload image to cloudinary
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }

      await Post.create({
        image: result.secure_url || '',
        cloudinaryId: result.public_id || '',
        take: req.body.post,
        comments: [],
        flames: [],
        user: req.user.id,
      });
      console.log("take has been added!");
      res.render("home.ejs", { title: 'Homepage' });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
