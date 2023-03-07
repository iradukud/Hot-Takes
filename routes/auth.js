const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");

//Main Routes - simplified for now
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.post("/signup", upload.single('profileImage'), authController.postSignup);

router.get("/followings/:id", authController.followings);

router.get("/account/:id", authController.getAccount);
router.put("/editUser/:id", upload.single('profileImage'), authController.editUser);
router.put("/editAccount/:id",  authController.editAccount);




module.exports = router;
