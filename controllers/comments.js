const Comment = require("../models/Comment");

module.exports = {
  //add comment to post  
  addComment: async (req, res) => {
    try {
      //save comment in DB
      await Comment.create({
        comment: req.body.comment,
        user: req.body.userId,
        postId: req.params.id,
      });

      console.log("comment added!");
      //redirect to post
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    };
  },

  //delete specified post
  editComment: async (req, res) => {
    try {

      //find and update selected comment
      await Comment.findByIdAndUpdate({ _id: req.params.id },
        {
          $set: {
            comment: req.body.comment,
          }
        });

      //find comment
      const comment = await Comment.findById({ _id: req.params.id });

      console.log("comment was edited");
      //redirect to post
      res.redirect(`/post/${comment['postId']}`);
    } catch (err) {
      res.redirect("/home");
    };
  },

  //delete specified post
  deleteComment: async (req, res) => {
    try {
      //find comment
      const comment = await Comment.findById({ _id: req.params.id });

      //delete comment
      await Comment.deleteOne({ _id: req.params.id });

      console.log("deleted comment!");
      //redirect to post
      res.redirect(`/post/${comment['postId']}`);
    } catch (err) {
      res.redirect("/home");
    };
  },

};