const cloudinary = require("../middleware/cloudinary");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like")

module.exports = {
  //create a new post
  createPost: async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user._id });

      let result = ''

      // Upload image to cloudinary, if provided
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }

      //save post in DB
      await Post.create({
        account: req.user._id,
        user: req.body.user,
        post: req.body.post,
        image: result.secure_url || '',
        followers: Array(user['followers'].length).fill(0).map((_, i) => user['followers'][i]),
        cloudinaryId: result.public_id || '',
      });

      console.log("post has been added!");
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },

  //create a new post
  getPost: async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user._id });

      //find clicked post - along side with poster, its like and comments
      const post = await mongoose.connection.db.collection("posts").aggregate([
        {
          //get all posts posted and followered by user
          $match: { _id: mongoose.Types.ObjectId(req.params['id']) }
        },
        {
          $lookup:
          {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "postUser"
          }

        },
        {
          $unwind: "$postUser"
        },
        {
          $project: {
            "postUser._id": 0,
            "postUser.cloudinaryId": 0,
            "postUser.account": 0,
          }
        },
        {
          $lookup:
          {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments"
          }
        },
        {
          $lookup:
          {
            from: "likes",
            localField: "_id",
            foreignField: "postId",
            as: "likes"
          },
        },
      ]).toArray();

      //find clicked post - comments and it's commenter
      const comments = await mongoose.connection.db.collection("comments").aggregate([
        {
          //get all posts comments
          $match: { postId: mongoose.Types.ObjectId(req.params['id']) }
        },
        {
          $lookup:
          {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "commentUser"
          }

        },
        {
          $unwind: "$commentUser"
        },
      ]).toArray();

      const likes = await mongoose.connection.db.collection("likes").aggregate([
        {
          //get all posts comments
          $match: { postId: mongoose.Types.ObjectId(req.params['id']) }
        },
        {
          $lookup:
          {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "likeUser"
          }

        },
        {
          $unwind: "$likeUser"
        },
      ]).toArray();


      console.log("post has been retrieved!");
      res.render("post.ejs", { title: 'Homepage', post: post, currentUser: user, comments: comments, likes: likes });
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
      await Post.findOneAndUpdate({ _id: req.body.postId }, {
        $push: { comments: comment['_id'] }
      });

      console.log("comment added!");
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },

  //like post
  likePost: async (req, res) => {
    try {
      //find if user already liked post
      const liked = await Like.findOne({ user: req.body.user, postId: req.body.postId });

      //if user has'nt liked the post create new like
      //else remove existing like
      if (!liked) {
        await Like.create({
          user: req.body.user,
          postId: req.body.postId,
        });
      } else {
        await Like.deleteOne({ user: req.body.user, postId: req.body.postId });
      };

      console.log("like added or removed");
      res.redirect(`/home`);
    } catch (err) {
      console.log(err);
    }
  },

  //edit post
  editPost: async (req, res) => {
    try {
      //retrieve post by id
      let post = await Post.findById({ _id: req.body.postId })
      let result = ''

      // Upload image to cloudinary, if provided
      // And save other changes
      if (req.file) {
        //delete post's image from cloudinary
        if (post.cloudinaryId) {
          await cloudinary.uploader.destroy(post.cloudinaryId);
        }

        //upload image to cloudinary
        result = await cloudinary.uploader.upload(req.file.path);

        //assign image and other changes to post
        await Post.findOneAndUpdate({ _id: req.body.postId },
          {
            $set: {
              image: result.secure_url,
              cloudinaryId: result.public_id,
              post: req.body.editPost,
            }
          });

      } else {
        //assign changes to post
        await Post.findOneAndUpdate({ _id: req.body.postId },
          {
            $set: {
              post: req.body.editPost,
            }
          });
      }

      console.log("post has been editted!");
      res.redirect('/home');
    } catch (err) {
      console.log(err);
    }
  },

  //delete specified post
  deletePost: async (req, res) => {
    try {
      //find post by id
      let post = await Post.findById({ _id: req.body.postId });

      //find all the related comments
      let comments = await Comment.find({ postId: req.body.postId });

      //remove comment's image from cloudinary
      comments.forEach(async (comment) => {
        if (comment.cloudinaryId) {
          await cloudinary.uploader.destroy(comment.cloudinaryId);
        }
      })

      //delete comments from db
      await Comment.deleteMany({ postId: req.body.postId });

      //delete post's image from cloudinary
      if (post.cloudinaryId) {
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }

      //delete post from db
      await Post.deleteOne({ _id: req.body.postId });

      console.log("Deleted Post");
      res.redirect("/home");
    } catch (err) {
      res.redirect("/home");
    }
  },

};
