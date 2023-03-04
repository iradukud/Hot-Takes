const passport = require("passport");
const validator = require("validator");
const Account = require("../models/Account");
const User = require("../models/User");
const Post = require("../models/Post");
const Following = require("../models/following");
const Follower = require("../models/follower");
const cloudinary = require("../middleware/cloudinary");

//login verification
exports.postLogin = (req, res, next) => {
  //variable that holds an array of error messages
  const validationErrors = [];

  //if any of the inputs parameters are empty add said messages to the validationErrors variable  
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Please enter a valid email address." });
  };
  if (validator.isEmpty(req.body.password)) {
    validationErrors.push({ msg: "Password cannot be blank." });
  };

  //if the validationErrors array has any messages redirect to index page with error presented to the user   
  if (validationErrors.length) {
    console.log('At least one input field is empty');
    req.flash("errors", validationErrors);
    return res.redirect("/");
  };

  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  //user authentification 
  passport.authenticate("local", (err, user, info) => {
    //if an error occurs end authentification process and return the error
    if (err) {
      return next(err);
    };

    //if user can't be find return corresponding error message and redirect to index page
    if (!user) {
      console.log("Email/Password arent't in our database")
      req.flash("errors", info);
      return res.redirect("/");
    };

    //user sign in
    req.logIn(user, (err) => {
      //if an error occurs end authentification process and return the error
      if (err) {
        return next(err);
      };

      //redirect to user's homepage
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/home");
    });
  })(req, res, next);
};

//user sign out
exports.logout = (req, res) => {
  //passport function to log out
  req.logout(() => {
    console.log('User has logged out.');
  });

  //remove current user's session
  req.session.destroy((err) => {
    //if error console.log log it
    if (err) {
      console.log("Error : Failed to destroy the session during logout.", err);
    };
    //delete current user name
    req.user = null;
    //redirect to homepage
    res.redirect("/");
  });
};

//signup verification
exports.postSignup = (req, res, next) => {
  //variable that holds an array of error messages
  const validationErrors = [];

  //if any of the inputs parameters are empty add said messages to the validationErrors variable 
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Please enter a valid email address." });
  };
  if (!validator.isLength(req.body.password, { min: 8 })) {
    validationErrors.push({ msg: "Password must be at least 8 characters long" });
  };

  //if inputted passwords don't match push error message into array
  if (req.body.password !== req.body.confirmPassword) {
    validationErrors.push({ msg: "Passwords do not match" });
  };

  //if the validationErrors array has any messages redirect to index page with error presented to the user     
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/");
  };

  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  //create new user using the User Schema
  const user = new Account({
    email: req.body.email,
    password: req.body.password,
  });

  //saving user's information
  Account.findOne(
    { $or: [{ email: req.body.email }, { userHandle: req.body.userHandle }] },
    (err, existingUser) => {

      //if an error occurs end function and return the error
      if (err) {
        return next(err);
      };

      //if user already exist return error and redirect back to index
      if (existingUser) {
        req.flash("errors", { msg: "Account with that email address or username already exists." });
        return res.redirect("/");
      };

      //save user's information and redirect to index page
      user.save((err) => {
        //if an error occurs end function and return the error
        if (err) {
          return next(err);
        }

        //user sign in
        req.logIn(user, async (err) => {
          //if an error occurs end function and return the error
          if (err) {
            return next(err);
          }

          let result = ''

          // Upload image to cloudinary, if provided
          if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
          }

          //save post in DB
          await User.create({
            userName: req.body.userName,
            userHandle: req.body.userHandle,
            profileImage: result.secure_url || 'https://res.cloudinary.com/dwwcootcr/image/upload/v1676950620/676-6764065_default-profile-picture-transparent-hd-png-download_zgrei6.png',
            cloudinaryId: result.public_id || '',
            following: [],
            follower: [],
            account: req.user.id,
          });

          res.redirect("/home");
        });
      });
    });
};

//follow or unfollow user
exports.followings = async (req, res, next) => {
  //find logged in user
  const user = await User.findOne({ account: req.user._id });

  //check is user is already following
  const follower = await Follower.findOne({ follower: req.user._id })

  if (follower) {
    //delete follow 
    await Follower.remove({ follower: user._id });
    //delete follower
    await Following.remove({ following: req.params.id });

    //remove user following to account
    await User.findOneAndUpdate({ account: req.user._id },
      {
        $pull: {
          following: req.params.id,
        }
      });

    //unfollow user's posts
    await Post.updateMany({ user: req.params.id },
      {
        $pull: {
          followers: user._id.toString(),
        }
      });

  }
  else {
    //create follower in DB
    await Follower.create({
      user: req.params.id,
      follower: user._id,
    });

    //create following in DB
    await Following.create({
      user: user._id,
      following: req.params.id,
    });

    //added user following to account
    await User.findOneAndUpdate({ account: req.user._id },
      {
        $push: {
          following: req.params.id,
        }
      });

    //follow user's posts
    await Post.updateMany({ user: req.params.id },
      {
        $push: {
          followers: user._id.toString(),
        }
      });

  }

  console.log('user has been follow or unfollowed!')
  res.redirect(`/profile/${req.params.id}`)

};