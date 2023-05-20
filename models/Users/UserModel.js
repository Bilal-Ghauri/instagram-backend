const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    profilePicture : {
        type : String,
        default : ''
    },
    coverPicture : {
        type : String,
        default  : ''
    },
    bio : {
        type : String, 
        default : ''
    },
    location :  {
        type : String, 
        default : ''
    },
    profession  : {
        type : String, 
        default : ''
    },
    DOB :  {
        type : Date, 
        default : ''
    },
    website : {
        type : String, 
        default : ''
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }
    ],
    bookmarks : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }
    ]
})

const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel