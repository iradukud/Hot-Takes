const cloudinary = require("../middleware/cloudinary");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const { findOne } = require("../models/User");

module.exports = {
  //create a new post
  createPost: async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user._id });

      let result = '';

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
    };
  },

  //get post
  getPost: async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user._id });

      //find clicked post - along side with poster, its like and comments
      const post = await mongoose.connection.db.collection("posts").aggregate([
        {
          //find clicked post
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

      //find comments and associated commenter of post
      const comments = await mongoose.connection.db.collection("comments").aggregate([
        {
          //get all associated comments
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

      //find likes and associated liker of post
      const likes = await mongoose.connection.db.collection("likes").aggregate([
        {
          //get all associated comments
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
      res.render("post.ejs", { title: 'Post', post: post[0], currentUser: user, comments: comments, likes: likes });
    } catch (err) {
      console.log(err);
    }
  },

  //like post
  likePost: async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user.id })

      //find if user already liked post
      const liked = await Like.findOne({ user: user['_id'], postId: req.params.id });

      if (!liked) {
        //if user hasn't liked the post create new like
        await Like.create({
          user: user['_id'],
          postId: req.params.id,
        });

      } else {
        //else remove existing like
        await Like.deleteOne({ user: user['_id'], postId: req.params.id });
      };

      console.log("like added or removed");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    };
  },

  //edit post
  editPost: async (req, res) => {
    try {
      //retrieve post by id
      let post = await Post.findById({ _id: req.params.id });
      let result = '';

      // Upload image to cloudinary, if provided
      if (req.file) {
        //delete post's image from cloudinary
        if (post.cloudinaryId) {
          await cloudinary.uploader.destroy(post.cloudinaryId);
        }

        //upload image to cloudinary
        result = await cloudinary.uploader.upload(req.file.path);

        //assign image and other changes to post
        await Post.findOneAndUpdate({ _id: req.params.id },
          {
            $set: {
              image: result.secure_url,
              cloudinaryId: result.public_id,
              post: req.body.post,
            }
          });

      } else {
        //save changes to post
        await Post.findOneAndUpdate({ _id: req.params.id },
          {
            $set: {
              post: req.body.post,
            }
          });
      }

      console.log("post has been edited!");
      //redirect to edited post
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },

  //delete specified post
  deletePost: async (req, res) => {
    try {
      //find post by id
      let post = await Post.findById({ _id: req.params.id });

      //delete comments from db
      await Comment.deleteMany({ postId: req.params.id });

      //delete post's image from cloudinary
      if (post.cloudinaryId) {
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }

      //delete post from db
      await Post.deleteOne({ _id: req.params.id });

      console.log("post deleted!");
      res.redirect("/home");
    } catch (err) {
      res.redirect("/home");
    }
  },

};