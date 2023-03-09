const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");

/* auth routes */
//login 
router.post("/login", authController.postLogin);
//sign up
router.post("/signup", upload.single('profileImage'), authController.postSignup);
//logout
router.get("/logout", authController.logout);
//follow/unfollow user
router.get("/followings/:id", authController.followings);
//get account page
router.get("/account/:id", authController.getAccount);
//edit user
router.put("/editUser/:id", upload.single('profileImage'), authController.editUser);
//edit account
router.put("/editAccount/:id",  authController.editAccount);
//delete account
router.put("/deleteAccount/:id",  authController.deleteAccount);

module.exports = router;