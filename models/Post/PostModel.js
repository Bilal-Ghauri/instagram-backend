const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  postOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  postImg: {
    type: String,
  },
  postContent: {
    type: String,
  },
  postLikes: {
    type: Array,
    default: []
  },
  bookmarks: {
    type: Array,
    default: []
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

const PostModel = mongoose.model('Post', PostSchema)
module.exports = PostModel  