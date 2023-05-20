const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    commentOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    text: {
        type: String
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reply"
        }
    ]
})

const CommentModel = mongoose.model('Comment', commentSchema)
module.exports = CommentModel  