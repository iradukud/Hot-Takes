const mongoose = require("mongoose");
const User = require("../models/User");

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

    let posts = []

    //find every post posted by posted by user and people their following
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //get all posts posted and followered by user
        $match: { $or: [{ user: user['_id'] }, { followers: user['_id'].toString() }] }
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
      { $sort: { createdAt: -1 } },
    ]).toArray();

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

    let posts = []

    //find every post posted by posted by user and people their following
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //get all posts posted and followered by user
        $match: { $or: [{ user: user['_id'] }, { followers: user['_id'].toString() }] }
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

    //store date for 7 days age
    const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = [...posts]
      //filter for posts older then last 7 days
      //probably change to 2 days
      .filter(post => post['createdAt'] >= sevenDayAgo)
      //sort post based on user interactions
      .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));

    res.render("explore.ejs", { title: 'Explore', trending: trending, currentUser: user });
  } catch (err) {
    console.log(err);
  }
};

//get trending   page
exports.getTrending = async (req, res) => {
  try {
    //find logged in user
    const user = await User.findOne({ account: req.user._id });

    let posts = []

    //find every post posted by posted by user and people their following
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //get all posts posted and followered by user
        $match: { $or: [{ user: user['_id'] }, { followers: user['_id'].toString() }] }
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

    //store date for 7 days age
    const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = [...posts]
      //filter for posts older then last 7 days
      //probably change to 2 days
      .filter(post => post['createdAt'] >= sevenDayAgo)
      //sort post based on user interactions
      .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));

    console.log("search has been completed!")

    //respond by rendering trending w/searched data
    res.render("trending.ejs", { title: 'Trending', trending: trending, currentUser: user });

  } catch (err) {
    console.log(err);
  }
};

//get profile page
exports.getProfile = async (req, res) => {
  try {
    //find logged in user
    const user = await User.findOne({ account: req.user._id });

    //find clicked user
    const profile = await User.findById({ _id: req.params.id });

    let posts = []
    let followers = []
    let following = []

    //find every post posted by posted by clicked user
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //implement way to fetch user's followers posts
        $match: { user: mongoose.Types.ObjectId(req.params.id) }
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

    //find every user's follower
    followers = await mongoose.connection.db.collection("followers").aggregate([
      {
        $match: { user: mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $lookup:
        {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "followers"
        }
      },
      {
        $unwind: "$followers"
      },
    ]).toArray();

    //find every user's follower
    following = await mongoose.connection.db.collection("followings").aggregate([
      {
        $match: { user: mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $lookup:
        {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "followingUsers"
        }
      },
      {
        $unwind: "$followingUsers"
      },
    ]).toArray();


    const hottest = [...posts]
      //sort post based on user interactions
      .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length))
      //select first 10 posts 
      .slice(0, 10);

    res.render("profile.ejs", { title: 'Profile', posts: posts, currentUser: user, profile: profile, following: following, followers: followers, hottest: hottest });
  } catch (err) {
    console.log(err);
  }
};

//complete a user search
exports.searchUsers = async (req, res) => {
  try {
    //find logged in user
    const user = await User.findOne({ account: req.user._id });

    let posts = []

    //find every post posted by posted by user and people their following
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //get all posts posted and followered by user
        $match: { $or: [{ user: user['_id'] }, { followers: user['_id'].toString() }] }
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


    //retrieves users that match the search
    const searchUsers = await User.find({ userHandle: { "$regex": req.body.search, "$options": "i" } });

    console.log("search has been completed!")

    //render page depending on where request came from
    if (req.body.title == 'Explore' || req.body.title == 'Trending') {
      //store date for 7 days age
      const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const trending = [...posts]
        //filter for posts older then last 7 days
        //probably change to 2 days
        .filter(post => post['createdAt'] >= sevenDayAgo)
        //sort post based on user interactions
        .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));

      if (req.body.title == 'Explore') {
        //respond by rendering homepage w/searched data
        res.render("explore.ejs", { title: 'Explore', trending: trending, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });
      } else if (req.body.title == 'Trending') {
        //respond by rendering trending w/searched data
        res.render("trending.ejs", { title: 'Trending', trending: trending, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });
      }

    } else if (req.body.title = 'Homepage') {
      //respond by rendering homepage w/searched data
      res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchUsers: searchUsers, searchItem: req.body.search });
    }

  } catch (err) {
    console.log(err);
  }

};

//complete a post search
exports.searchPosts = async (req, res) => {
  try {
    //find logged in user
    const user = await User.findOne({ account: req.user._id });

    console.log(user)

    let posts = []

    //find every post posted by posted by user and people their following
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //get all posts posted and followered by user
        $match: { $or: [{ user: user['_id'] }, { followers: user['_id'] }] }
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
      }, {
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

    console.log("search has been completed!")

    //render page depending on where request came from
    if (req.body.title == 'Explore' || req.body.title == 'Trending') {
      //store date for 7 days age
      const sevenDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const trending = [...posts]
        //filter for posts older then last 7 days
        //probably change to 2 days
        .filter(post => post['createdAt'] >= sevenDayAgo)
        //sort post based on user interactions
        .sort((postA, postB) => (postB['likes'].length + postB['comments'].length) - (postA['likes'].length + postA['comments'].length));

      if (req.body.title == 'Explore') {
        //respond by rendering homepage w/searched data
        res.render("explore.ejs", { title: 'Explore', trending: trending, currentUser: user, searchPosts: searchPosts, searchItem: req.body.search });
      } else if (req.body.title == 'Trending') {
        //respond by rendering trending w/searched data
        res.render("trending.ejs", { title: 'Trending', trending: trending, currentUser: user, searchPosts: searchPosts, searchItem: req.body.search });
      }

    } else if (req.body.title = 'Homepage') {
      //respond by rendering homepage w/searched data
      res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user, searchPosts: searchPosts, searchItem: req.body.search });
    }

  } catch (err) {
    console.log(err);
  }

};

//get profile page
exports.getMessage = async (req, res) => {
  try {
    //find logged in user
    const user = await User.findOne({ account: req.user._id });

    //find clicked user
    const profile = await User.findById({ _id: req.params.id });

    //find every message between users
    /*
    posts = await mongoose.connection.db.collection("posts").aggregate([
      {
        //implement way to fetch user's followers posts
        $match: { user: mongoose.Types.ObjectId(req.params.id) }
      },
      ]).toArray();
     */ 
     

    res.render("messages.ejs", { title: 'Messages', currentUser: user, profile: profile, });
  } catch (err) {
    console.log(err);
  }
};