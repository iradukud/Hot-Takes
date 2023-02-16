const User = require("../models/User");
const Post = require("../models/Post");


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
    const user = await User.findById({ _id: req.user.id });
    const posts = await Post.find({ user: req.user }).sort({ createdAt: "desc" }).lean();
    res.render("home.ejs", { title: 'Homepage', posts: posts, user: user });
  } catch (err) {
    console.log(err);
  }
}