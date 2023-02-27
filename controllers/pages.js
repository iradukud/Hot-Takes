const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

//get main/index page
exports.getIndex = (req, res) => {
  //if already signed in redirect to dashboard
  if (req.user) {
    return res.redirect("/home");
  };
  res.render("index.ejs", { title: "Login or Signup" });
};

//get homepage
exports.getHome = async (req, res) => {
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
    console.log(posts)
    res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user });
  } catch (err) {
    console.log(err);
  }
};

//complete a general search
exports.searchUsers = async (req, res) => {
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
    const searchUsers = await User.find({ userHandle: { "$regex": req.body.search, "$options": "i" } });

    console.log("search has been completed!")
    res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });

  } catch (err) {
    console.log(err);
  }

};