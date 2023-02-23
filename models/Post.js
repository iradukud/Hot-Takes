const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  take: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Post", PostSchema);
