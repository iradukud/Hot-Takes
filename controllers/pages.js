const User = require("../models/User");
const Post = require("../models/Post");
const mongoose = require("mongoose");


//get main/index page
exports.getIndex = (req, res) => {
  //if already signed in redirect to dashboard
  if (req.user) {
    return res.redirect("/homepage");
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
    //find every post posted by posted by user and people their following
    const posts = await mongoose.connection.db.collection("posts").aggregate([
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
    ]).toArray();

    res.render("home.ejs", { title: 'Homepage', posts: posts, currentUser: user });
  } catch (err) {
    console.log(err);
  }
}