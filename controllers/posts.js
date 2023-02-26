const cloudinary = require("../middleware/cloudinary");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like")

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
        account: req.user._id,
        user: req.body.user,
        post: req.body.post,
        image: result.secure_url || '',
        cloudinaryId: result.public_id || '',
      });

      const post = await Post.findOne({ account: req.user._id });

      console.log("post has been added!");
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
        await Like.remove({ user: req.body.user, postId: req.body.postId });
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
      await Comment.remove({ postId: req.body.postId });

      //delete post's image from cloudinary
      if (post.cloudinaryId) {
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }

      //delete post from db
      await Post.remove({ _id: req.body.postId });

      console.log("Deleted Post");
      res.redirect("/home");
    } catch (err) {
      res.redirect("/home");
    }
  },
  //complete a general search
  searchUsers : async (req, res) => {
    try {
      //find logged in user
      const user = await User.findOne({ account: req.user._id });
      //retrieve one via account id
      const post = await Post.findOne({ account: req.user._id });

      let posts = []

      //if user has posted anything
      if (post) {
        //find every post posted by posted by user and people their following
        posts = await mongoose.connection.db.collection("posts").aggregate([
          {
            //implement way to fetch user's followers posts
            $match: { user: post.user }
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
            }
          },
        ]).toArray();
      }

      //retrieves users that match the search
      const searchUsers = await User.find({ userHandle: { "$regex": req.body.search, "$options": "i" }, userHandle: { $ne: user['_id'] } });

      //retrieves post that match the search
      const searchPosts = posts = await mongoose.connection.db.collection("posts").aggregate([
        {
          //implement way to fetch user's followers posts
          $match: { post: { "$regex": req.body.search, "$options": "i" } }
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
      ]).toArray();


      console.log("search has been completed!")
      res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchUsers: searchUsers, searchPosts: searchPosts, searchItem: req.body.search });

    } catch (err) {
      console.log(err);
    }

  },
};
