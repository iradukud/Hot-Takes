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
    res.render("home.ejs", { title: 'Homepage' });
  } catch (err) {
    console.log(err);
  }
}