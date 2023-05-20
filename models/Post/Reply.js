const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
    replyOwner: {
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
})

const ReplyModel = mongoose.model('Reply', ReplySchema)
module.exports = ReplyModel  