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

//get explore page
exports.getExplore = async (req, res) => {
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
      ]).toArray()
    }

    //store date for 7 days age
    const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = [...posts]
      //filter for posts older then last 7 days
      //probably change to 2 days
      .filter(post => post['createdAt'] >= sevenDayAgo)
      //sort post based on user interactions
      .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));

    console.log(posts);
    res.render("explore.ejs", { title: 'Explore', trending: trending, currentUser: user });
  } catch (err) {
    console.log(err);
  }
};

//complete a user search
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
    
    //store date for 7 days age
    const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = [...posts]
      //filter for posts older then last 7 days
      //probably change to 2 days
      .filter(post => post['createdAt'] >= sevenDayAgo)
      //sort post based on user interactions
      .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));
    //retrieves users that match the search
    const searchUsers = await User.find({ userHandle: { "$regex": req.body.search, "$options": "i" } });

    console.log("search has been completed!")

    //render page depending on where request came from
    if (req.body.title == 'Explore') {
      //respond by rendering homepage w/searched data
      res.render("explore.ejs", { title: 'Explore', trending: trending, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });
    } else if (req.body.title = 'Homepage') {
      //respond by rendering homepage w/searched data
      res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });
    }

  } catch (err) {
    console.log(err);
  }

};

//complete a general search
exports.searchPosts = async (req, res) => {
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

    //retrieves post that match the search
    const searchPosts = await mongoose.connection.db.collection("posts").aggregate([
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
    res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchPosts: searchPosts, searchItem: req.body.search });

  } catch (err) {
    console.log(err);
  }

};