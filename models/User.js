const mongoose = require("mongoose");

//user information schema
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
  },
  userHandle: {
    type: String,
    require: true,
    unique: true,
  },
  profileImage: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  following: {
    type: Array,
    require: true,
  },
  followers: {
    type: Array,
    require: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
});

module.exports = mongoose.model("User", UserSchema);