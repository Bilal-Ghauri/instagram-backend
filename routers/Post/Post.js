const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const PostModel = require("../../models/Post/PostModel");
const UserModel = require("../../models/Users/UserModel")
const CommentModel = require('../../models/Post/Comment')
const UserMiddleware = require("../../middlewares/UserMiddleware");

router.post("/post-image-upload", UserMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.files["image"].tempFilePath,
      {
        use_filename: true,
        folder: "hellogram",
      }
    );
    if (result) {
      return res.status(200).json({ url: result.secure_url });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/user-post", UserMiddleware, async (req, res) => {
  try {
    const { postContent, postImg } = req.body;

    const user = await UserModel.findById(req.userId)
    if (user) {
      if (postContent == "" && postImg == "") {
        return res.status(402).json("One of the fields is required");
      }

      const newPost = new PostModel({
        postOwner: user._id,
        postContent,
        postImg,
      });
      let post = await newPost.save();
      if (post) {
        post = await PostModel.findById({ _id: post?._id }).populate('postOwner')
      }

      await UserModel.findByIdAndUpdate(
        req.userId,
        {
          $push: {
            posts: post._id,
          },
        },
        { new: true }
      );

      return res.status(200).json({ msg: "Post Created", post });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/get/all-posts", UserMiddleware, async (req, res) => {
  try {
    // await PostModel.deleteMany()
    // return res.sendStatus(200)
    const posts = await PostModel.find({ postOwner: req.userId })
      .populate("postOwner")
      .exec((err, posts) => {
        if (err) {
          console.log(err);
          return;
        }

        return res.status(200).json({ posts });
      });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/get/all/posts/forUser', UserMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    let arr;
    const findUser = await UserModel.findById(userId)
    if (findUser) {
      arr = [...findUser.followers, ...findUser.following, userId]
      const uniqueArray = [];
      const uniqueObject = {};

      for (let i = 0; i < arr.length; i++) {
        if (!uniqueObject[arr[i]]) {
          uniqueArray.push(arr[i]);
          uniqueObject[arr[i]] = 1;
        }
      }
      let allPosts = []
      for (let i = 0; i < uniqueArray?.length; i++) {
        let postFinds = await PostModel.find({ postOwner: uniqueArray[i] }).populate('postOwner')
        if (postFinds) {
          allPosts.push(...postFinds)
        }
      }
      allPosts = allPosts.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      res.status(200).json(allPosts)
    }


  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/like/post', async (req, res) => {
  try {
    const { postId, userId } = req.body
    const findPost = await PostModel.findOne({ _id: postId })
    await PostModel.findByIdAndUpdate({ _id: postId }, { postLikes: [...findPost.postLikes, userId] }, { new: true })
    return res.statusCode(200)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/dislike/post', async (req, res) => {
  try {
    const { postId, userId } = req.body
    const findPost = await PostModel.findOne({ _id: postId })
    let likesArr = [...findPost.postLikes].filter(item => item !== userId)
    await PostModel.findByIdAndUpdate({ _id: postId }, { postLikes: likesArr }, { new: true })
    return res.statusCode(200)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/add/bookmark', async (req, res) => {
  try {
    const { postId, userId } = req.body
    await UserModel.findByIdAndUpdate(
      userId,
      { $push: { bookmarks: postId } },
      { new: true } // Return the updated user object
    );
    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.get('/get/bookmarks', UserMiddleware, async (req, res) => {
  try {
    const id = req.userId
    const findUser = await UserModel.findById({ _id: id }).populate('bookmarks')
    let bookmarksarr = []
    for (let i = 0; i < findUser?.bookmarks?.length; i++) {
      let singleBookMark = await PostModel.findById({ _id: findUser?.bookmarks[i]._id }).populate('postOwner')
      if (singleBookMark) {
        bookmarksarr.push(singleBookMark)
      }
    }
    res.status(200).json(bookmarksarr)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/remove/bookmark', async (req, res) => {
  try {
    const { postId, userId } = req.body
    await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { bookmarks: postId } },
      { new: true } // Return the updated user object
    );
    res.sendStatus(200)
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.get('/get/singlepost/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    let findPost = await PostModel.findById({ _id: postId }).populate('postOwner').populate('comments')
    let newCommentsArray = []
    for (let i = 0; i < findPost?.comments?.length; i++) {
      let findComment = await CommentModel.findById(findPost?.comments[i]?._id).populate('commentOwner')
      if (findComment) {
        newCommentsArray.push(findComment)
      }
    }
    findPost = { ...findPost._doc, comments: newCommentsArray }
    if (findPost) {
      return res.status(200).json(findPost)
    } else {
      return res.status(404).json({ msg: "No post found with this specified id" })
    }
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/delete/post/:postId', UserMiddleware, async (req, res) => {
  try {
    const id = req.userId
    const { userId } = req.body
    if (id !== userId) return
    const { postId } = req.params
    await PostModel.findOneAndDelete({ _id: postId })
    return res.status(200).json({ msg: "Post Deleted" })
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/create/comment', UserMiddleware, async (req, res) => {
  try {
    const { postId, commentText } = req.body
    const newComment = new CommentModel({
      commentOwner: req.userId,
      text: commentText
    })
    const comment = await newComment.save()
    if (comment) {
      await PostModel.findByIdAndUpdate(postId, {
        $push: {
          comments: comment._id,
        },
      }, { new: true })
    }
    let findPost = await PostModel.findOne({ _id: postId }).populate("postOwner").populate('comments')
    let newCommentsArray = []
    for (let i = 0; i < findPost?.comments?.length; i++) {
      let findComment = await CommentModel.findById(findPost?.comments[i]?._id).populate('commentOwner')
      if (findComment) {
        newCommentsArray.push(findComment)
      }
    }
    findPost = { ...findPost._doc, comments: newCommentsArray }
    return res.status(200).json({ post: findPost })
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

router.post('/delete/comment/:postId/:commentId', UserMiddleware, async (req, res) => {
  try {
    const { commentId, postId } = req.params
    const { currentUserId } = req.body
    if (currentUserId == req.userId) {
      await PostModel.findByIdAndUpdate(postId, { $pull: { comments: commentId } }, { new: true })
      await CommentModel.findByIdAndDelete({ _id: commentId })
      res.status(200).json({ msg: 'Comment Deleted' })
    }
    res.status(400).json({ msg: "Invalid User" })
  } catch (error) {
    return res.status(500).json(error.message)
  }
})

module.exports = router;
