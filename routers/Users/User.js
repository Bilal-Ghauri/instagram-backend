const express = require("express");
const router = express.Router();
const UserMiddleware = require("../../middlewares/UserMiddleware");
const cloudinary = require("cloudinary").v2;
const UserModel = require("../../models/Users/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const PostModel = require("../../models/Post/PostModel");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await UserModel.findOne({ email: email });
    if (userExist) {
      return res.status(402).json({ msg: "User already exist" });
    }

    const newUser = new UserModel({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    let user = await newUser.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return res.status(200).json({ token, user: newUser });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log(email, password);
//     const userExist = await UserModel.findOne({ email })
//       .populate("followers")
//       .populate("following")
//       .populate("posts")
//       .populate("bookmarks");
//     if (!userExist) {
//       return res.status(402).json({ msg: "User does not exist" });
//     }

//     let verifyPassword = await bcrypt.compare(password, userExist.password);
//     if (!verifyPassword) {
//       return res.status(402).json({ msg: "Invalid Credentials" });
//     }

//     for (let i = 0; i < userExist?.posts?.length; i++) {
//       let post = await PostModel.findById(userExist?.posts[i]._id).populate('postOwner')
//       if (post) {
//         userExist.posts[i] = post
//       }
//     }



//     let allPoplulatedFollowers = [];
//     let allPoplulatedFollowings = [];

//     for (let i = 0; i <= userExist?.followers?.length; i++) {
//       let getUser = await UserModel.findById(
//         userExist?.followers[i]?._id
//       ).populate("posts");

//       if (getUser) {
//         allPoplulatedFollowers.push(getUser);
//       }
//     }
//     for (let i = 0; i <= userExist?.following?.length; i++) {
//       let getUser = await UserModel.findById(
//         userExist?.following[i]?._id
//       ).populate("posts");
//       if (getUser) {
//         allPoplulatedFollowings.push(getUser);
//       }
//     }

//     for (let i = 0; i < allPoplulatedFollowers.length; i++) {
//       for (let j = 0; j < allPoplulatedFollowers[i]?.posts?.length; j++) {
//         if (allPoplulatedFollowers[i]?.posts[j] !== null) {
//           let postIndex = j;
//           let followerIndex = i;
//           let post = await PostModel.findById(allPoplulatedFollowers[i]?.posts[j]?._id).populate("postOwner")
//           if (post) {
//             allPoplulatedFollowers[followerIndex].posts[postIndex] = post;
//           }
//         }
//       }
//     }

//     for (let i = 0; i < allPoplulatedFollowings.length; i++) {
//       for (let j = 0; j < allPoplulatedFollowings[i]?.posts?.length; j++) {
//         if (allPoplulatedFollowings[i]?.posts[j] !== null) {
//           let postIndex = j;
//           let followerIndex = i;
//           let post = await PostModel.findById(allPoplulatedFollowings[i]?.posts[j]?._id).populate("postOwner")
//           if (post) {
//             allPoplulatedFollowings[followerIndex].posts[postIndex] = post;
//           }
//         }
//       }
//     }

//     userExist.followers = allPoplulatedFollowers;
//     userExist.following = allPoplulatedFollowings;

//     let token = jwt.sign({ userId: userExist._id }, process.env.JWT_SECRET);
//     return res.status(200).json({ token, user: userExist });
//   } catch (error) {
//     return res.status(500).json({ msg: error.message });
//   }
// });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await UserModel.findOne({ email }).populate("followers")
      .populate("following")
      .populate("posts")
      .populate("bookmarks");
    if (!userExist) {
      return res.status(402).json({ msg: "User does not exist" });
    }

    let verifyPassword = await bcrypt.compare(password, userExist.password);
    if (!verifyPassword) {
      return res.status(402).json({ msg: "Invalid Credentials" });
    }
    let token = jwt.sign({ userId: userExist._id }, process.env.JWT_SECRET);
    return res.status(200).json({ token, user: userExist });

  } catch (error) {
    return res.status(500).json({ msg: error.message })
  }
})

router.get("/get/user", UserMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    let user = await UserModel.findById({ _id: userId })
      .populate("followers")
      .populate("following")
      .populate("posts")
      .populate("bookmarks");
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" })
  }
})

// router.get("/get/user", UserMiddleware, async (req, res) => {
//   try {
//     const userId = req.userId;
//     let user = await UserModel.findById({ _id: userId })
//       .populate("followers")
//       .populate("following")
//       .populate("posts")
//       .populate("bookmarks");

//     for (let i = 0; i < user?.posts?.length; i++) {
//       let post = await PostModel.findById(user?.posts[i]._id).populate('postOwner')
//       if (post) {
//         user.posts[i] = post
//       }
//     }

//     let allPoplulatedFollowers = [];
//     let allPoplulatedFollowings = [];

//     for (let i = 0; i <= user?.followers?.length; i++) {
//       let getUser = await UserModel.findById(user?.followers[i]?._id).populate(
//         "posts"
//       );

//       if (getUser) {
//         allPoplulatedFollowers.push(getUser);
//       }
//     }
//     for (let i = 0; i <= user?.following?.length; i++) {
//       let getUser = await UserModel.findById(user?.following[i]?._id).populate(
//         "posts"
//       );
//       if (getUser) {
//         allPoplulatedFollowings.push(getUser);
//       }
//     }


//     for (let i = 0; i < allPoplulatedFollowers.length; i++) {
//       for (let j = 0; j < allPoplulatedFollowers[i]?.posts?.length; j++) {
//         if (allPoplulatedFollowers[i]?.posts[j] !== null) {
//           let postIndex = j;
//           let followerIndex = i;
//           let post = await PostModel.findById(allPoplulatedFollowers[i]?.posts[j]?._id).populate("postOwner")
//           if (post) {
//             allPoplulatedFollowers[followerIndex].posts[postIndex] = post;
//           }
//         }
//       }
//     }

//     for (let i = 0; i < allPoplulatedFollowings.length; i++) {
//       for (let j = 0; j < allPoplulatedFollowings[i]?.posts?.length; j++) {
//         if (allPoplulatedFollowings[i]?.posts[j] !== null) {
//           let postIndex = j;
//           let followerIndex = i;
//           let post = await PostModel.findById(allPoplulatedFollowings[i]?.posts[j]?._id).populate("postOwner")
//           if (post) {
//             allPoplulatedFollowings[followerIndex].posts[postIndex] = post;
//           }
//         }
//       }
//     }

//     user.followers = allPoplulatedFollowers;
//     user.following = allPoplulatedFollowings;

//     return res
//       .status(200)
//       .json({
//         user,
//         allPoplulatedFollowers,
//         allPoplulatedFollowings,
//       });
//   } catch (error) {
//     return res.status(500).json({ msg: error.message });
//   }
// });

router.post("/upload", UserMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const files = req.files;

    const urls = {};
    if (files.coverPhoto) {
      const result = await cloudinary.uploader.upload(
        files["coverPhoto"].tempFilePath,
        {
          use_filename: true,
          folder: "hellogram",
        }
      );
      if (result) {
        urls.coverPhoto = result.secure_url;
      }
    }
    if (files.profilePhoto) {
      const result = await cloudinary.uploader.upload(
        files["profilePhoto"].tempFilePath,
        {
          use_filename: true,
          folder: "hellogram",
        }
      );
      if (result) {
        urls.profilePhoto = result.secure_url;
        console.log(result);
      }
    }
    if (urls.coverPhoto || urls.profilePhoto) {
      return res.status(200).json(urls);
    }
    return res
      .status(400)
      .json({ msg: "Both coverPhoto and profilePhoto are required" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/update/user", UserMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findByIdAndUpdate({ _id: userId }, req.body, {
      new: true,
    });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.get("/get/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findOne({ _id: id })
      .populate("followers")
      .populate("following")
      .populate("posts")
      .populate("bookmarks");
    if (!user) {
      return res.status(403).json({ msg: "User not exist" });
    }
    for (let i = 0; i < user?.posts?.length; i++) {
      let post = await PostModel.findById(user?.posts[i]._id).populate('postOwner')
      if (post) {
        user.posts[i] = post
      }
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/find/user", async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name);
    const users = await UserModel.find({
      name: { $regex: name, $options: "i" },
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/follow/user", UserMiddleware, async (req, res) => {
  try {
    let userId = req.userId;
    let followId = req.body.followId;

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          following: followId,
        },
      },
      {
        new: true,
      }
    );

    await UserModel.findByIdAndUpdate(
      followId,
      {
        $push: {
          followers: userId,
        },
      },
      {
        new: true,
      }
    );

    let currentUser = await UserModel.findById({ _id: userId });
    let followUser = await UserModel.findById({ _id: followId });

    return res.status(200).json({ currentUser, followUser });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/unfollow/user", UserMiddleware, async (req, res) => {
  try {
    let userId = req.userId;
    let followId = req.body.followId;

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          following: followId,
        },
      },
      { new: true }
    );

    await UserModel.findByIdAndUpdate(
      followId,
      {
        $pull: {
          followers: userId,
        },
      },
      { new: true }
    );

    let currentUser = await UserModel.findById({ _id: userId });
    let followUser = await UserModel.findById({ _id: followId });

    return res.status(200).json({ currentUser, followUser });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
