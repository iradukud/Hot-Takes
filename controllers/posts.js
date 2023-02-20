const cloudinary = require("../middleware/cloudinary");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

module.exports = {
  //create a new post
  createPost: async (req, res) => {
    try {
      let result = ''

      // Upload image to cloudinary, if provided
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }

      //save post in DB
      await Post.create({
        account:req.user._id,
        user: req.body.user,
        take: req.body.post,
        image: result.secure_url || '',
        cloudinaryId: result.public_id || '',
        comments: [],
        flames: [],
      });

      const post = await Post.findOne({ account: req.user._id });

      console.log("take has been added!");
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },
  //add comment to post  
  addComment: async (req, res) => {
    let result = ''

    // Upload image to cloudinary, if provided
    if (req.file) {
      result = await cloudinary.uploader.upload(req.file.path);
    }

    try {
      //save comment in DB
      await Comment.create({ 
        comment: req.body.comment,
        image: result.secure_url || '',
        cloudinaryId: result.public_id || '',
        user: req.body.userId,
        postId: req.body.postId,
      });

      //retrieve created comment
      const comment = await Comment.findOne({ user: req.body.userId, postId: req.body.postId, comment: req.body.comment, });
      
      //placed the created comment
      await Post.findOneAndUpdate({_id: req.body.postId},{
        $push: {comments:comment['_id']}
      });

      console.log("comment added!");
      res.redirect('/home');
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
