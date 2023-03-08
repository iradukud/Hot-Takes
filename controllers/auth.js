const passport = require("passport");
const validator = require("validator");
const bcrypt = require("bcrypt");
const Account = require("../models/Account");
const User = require("../models/User");
const Post = require("../models/Post");
const Following = require("../models/following");
const Follower = require("../models/follower");
const cloudinary = require("../middleware/cloudinary");
const { request } = require("express");

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

//get account page
exports.getAccount = async (req, res, next) => {
  //find logged in user
  const user = await User.findById({ _id: req.params.id });
  const account = await Account.findById({ _id: user['account'] });

  console.log('account page has been retrieved!')
  //render account page of user
  res.render("account.ejs", { title: 'Account', currentUser: user, email: account['email'] });
};

//edit user details
exports.editUser = async (req, res, next) => {
  //find logged in user
  let user = await User.findById({ _id: req.params.id });

  try {
    //if userName is provide
    if (req.body.userName) {
      //change current userName
      await User.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
          userName: req.body.userName,
        }
      });
    };

    //if userHandle is provide
    if (req.body.userHandle) {
      //change current userHandle
      await User.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
          userHandle: req.body.userHandle,
        }
      });
    };

    //if image provided
    if (req.file) {
      //delete user's profile image from cloudinary
      if (user.cloudinaryId) {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      }

      //upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //change current profile image
      await User.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
          profileImage: result.secure_url,
          cloudinaryId: result.public_id,
        }
      });
    };

    console.log('user detail(s) have been edited!')
    //render account page of user
    res.redirect(`/auth/account/${req.params.id}`);
  } catch {
    res.redirect(`/auth/account/${req.params.id}`);
  }
};

//edit user details
exports.editAccount = async (req, res, next) => {
  //find logged in user
  let user = await User.findById({ _id: req.params.id });
  let account = await Account.findById({ _id: req.user['_id'] })

  //variable that holds an array of error messages
  const validationErrors = [];


  try {
    //if email is provide
    if (req.body.email) {
      //if any of the inputs parameters are empty add said messages to the validationErrors variable  
      if (!validator.isEmail(req.body.email)) {
        validationErrors.push({ msg: "Please enter a valid email address." });
      };

      req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false,
      });

      //check to see if user's email exist
      Account.findOne(
        { email: req.body.email },
        async (err, existingUser) => {

          //if an error occurs end function and return the error
          if (err) {
            return next(err);
          };
          //if user is already in use return error and redirect back to account page
          if (existingUser) {
            req.flash("errors", { msg: "Account with that email already exists." });

            console.log('Account with that email already exists.')
            //redirect to account page with error message
            req.flash("errors", { msg: 'Account with that email already exists.' });
            res.redirect(`/auth/account/${req.params.id}`);
          } else {
            //else change the current account's username
            await Account.findByIdAndUpdate({ _id: user['account'] },
              {
                $set: {
                  email: req.body.email
                }
              });

            console.log('Account email has been changed.');
            //redirect to account page with information message
            req.flash("info", { msg: 'Email change successful' });
            res.redirect(`/auth/account/${req.params.id}`);
          };
        }
      );
    };

    //if password inputs are provide
    if (req.body.currentPassword && req.body.password && req.body.confirmPassword) {
      //if password length is to short add error message to array
      if (!validator.isLength(req.body.password, { min: 8 })) {
        console.log("Password must be at least 8 characters long!");
        validationErrors.push({ msg: "Password must be at least 8 characters long" });
      };

      //if inputted new passwords don't match add error message to array
      if (req.body.password !== req.body.confirmPassword) {
        console.log("new passwords do not match!");
        validationErrors.push({ msg: "Passwords do not match" });
      };

      //check to see if the inputted password matches our data
      bcrypt.compare(req.body.currentPassword, account.password, (err, isMatch) => {
        //if error throw error message
        if (err) {
          throw err;
        } else if (!isMatch) {
          console.log("Password doesn't match account password!");
          //redirect to account page with error message
          validationErrors.push({ msg: "password doesn't match account password" });
        };
      });

      //if the validationErrors array has any messages redirect to account page with error presented to the user   
      if (validationErrors.length) {
        console.log('At least one input field has a problem');

        //redirect to account page with error message
        req.flash("errors", validationErrors);
        return res.redirect(`/auth/account/${req.params.id}`);

      } else {
        //change password
        //encryting the new password
        const hash = await bcrypt.hash(req.body.password, 10)

        //find and change user's password
        await Account.findByIdAndUpdate({ _id: req.user['_id'] },
          {
            set: {
              password: hash
            }
          });

        console.log('Account password changed.');
        //redirect to information message
        req.flash("info", { msg: 'Password change successful' });
        return res.redirect(`/auth/account/${req.params.id}`);
      }
    }
  }
  catch {
    res.redirect(`/auth/account/${req.params.id}`);
  }
}


//follow or unfollow user
exports.followings = async (req, res, next) => {
  //find logged in user
  const user = await User.findOne({ account: req.user._id });

  //check is user is already following
  const follower = await Follower.findOne({ follower: user['_id'], user: req.params.id })

  if (follower) {
    //delete follow 
    await Follower.deleteOne({ follower: user['_id'], user: req.params.id });
    //delete follower
    await Following.deleteOne({ following: req.params.id, user: user['_id'] });

    //remove user following to account
    await User.findByIdAndUpdate({ _id: user['_id'] },
      {
        $pull: {
          following: req.params.id,
        }
      });

    //remove user follower to account
    await User.findByIdAndUpdate({ _id: req.params.id },
      {
        $pull: {
          followers: user['_id'].toString(),
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
      follower: user['_id'],
    });

    //create following in DB
    await Following.create({
      user: user['_id'],
      following: req.params.id,
    });


    //add current to following of other user
    await User.findByIdAndUpdate({ _id: user['_id'] },
      {
        $push: {
          following: req.params.id,
        }
      });

    //added user follower to account
    await User.findByIdAndUpdate({ _id: req.params.id },
      {
        $push: {
          followers: user['_id'].toString(),
        }
      });

    //follow user's posts
    await Post.updateMany({ user: req.params.id },
      {
        $push: {
          followers: user['_id'].toString(),
        }
      });

  }

  console.log('user has been follow or unfollowed!')
  res.redirect(`/profile/${req.params.id}`)

};