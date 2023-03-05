const cloudinary = require("../middleware/cloudinary");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

//send message to user
exports.sendMessage = async (req, res) => {
    try {
        //find logged in user
        const user = await User.findOne({ _id: req.body.senderId });

        //find message recipient
        const otherUser = await User.findById({ _id: req.body.recieverId });

        //save message in DB
        await Message.create({
            sender: req.body.senderId,
            recipient: req.body.recieverId,
            message: req.body.message,
        });

        //find every message between users
        const messages = await mongoose.connection.db.collection("messages").aggregate([
            {
                $match: {
                    $or: [
                        { sender: user['_id'], recipient: mongoose.Types.ObjectId(req.body.recieverId) },
                        { sender: mongoose.Types.ObjectId(req.body.recieverId), recipient: user['_id'] }
                    ]
                }
            },
        ]).toArray();

        res.render("messages.ejs", { title: 'Messages', currentUser: user, otherUser: otherUser, messages: messages });
    } catch (err) {
        console.log(err)
    }
}
