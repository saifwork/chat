const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Invite = require("../models/inviteModel");
const Request = require("../models/requestModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

//@desc Register a User
//@route  POST /api/users/register
//@access public

const registerUser = asyncHandler(async (req, res) => {

  console.log('inside register');
  const { username, email, password, occupation } = req.body;
  console.log(req.body);
  if (!username || !email || !password || !occupation) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password.toString(), 10);
  console.log(hashedPassword);
  const avatar_Id = Math.floor(Math.random() * 9) + 1;
  console.log(avatar_Id);
  const user = await User.create({
    avatar_Id,
    username,
    occupation,
    email,
    password: hashedPassword,
  });

  if (user) {
    return res.status(200).json({ _id: user._id, avatar_id: user.avatar_Id, username: user.username, email: user.email, occupation: user.occupation });
  }
  else {
    res.status(400);
    throw new Error("User data was not valid");
  }
  res.json({ message: "Register Successfully" });
});

//@desc Login a User
//@route  POST /api/users/login
//@access public

  const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
      res.statuus(400);
      throw new Error("All fields are mandatory!");
    }

    const user = await User.findOne({ email });
    // compare user password with hashed password;
    if (user && (await bcrypt.compare(password, user.password))) {

      const accessToken = jwt.sign({
        user: {
          _id: user._id,
          avatar_Id: user.avatar_Id,
          username: user.username,
          occupation: user.occupation,
          email: user.email,
        },
      },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1000m"
        },
      );
      res.status(200).json({ accessToken });
    }
    else {
      res.status(401);
      throw new Error("Email and Password is not valid");
    }
  });

//@desc Current User
//@route  POST /api/users/current
//@access private

const currentUser = asyncHandler(async (req, res) => {
  console.log(res.user)
  const modifiedUser = {
    _id: req.user.id,
    avatar_Id: req.user.avatar_Id,
    username: req.user.username,
    email: req.user.email,
    occupation: req.user.occupation,
  };
  res.json(modifiedUser);
});

const allUsers = asyncHandler(async (req, res) => {
  console.log('inside allUsers');
  const currentUserId = req.user.id;
  console.log(currentUserId);
  const userIdObjectId = new mongoose.Types.ObjectId(currentUserId);

  // Use projection to exclude the 'password' field
  const users = await User.find({ _id: { $ne: userIdObjectId } }, { password: 0 });

  res.status(200).json( users );
});



//@desc Get InvitedUsers
//@route  Get /api/users/invitedUsers
//@access private

const invitedUser = asyncHandler(async (req, res) => {

  const userId = req.user.id;
  console.log(userId.toString()); 
  const userIdObjectId = new mongoose.Types.ObjectId(userId);
  console.log(userIdObjectId);
  const userInvites = await Request.findOne({ user_id: userIdObjectId }).populate("requestedUsers", "avatar_Id username email occupation"); // Populate invitedUsers with selected fields

  console.log(userInvites);

  if (!userInvites) {
    res.status(404).json({ message: "User invites not found" });
  } else {
    res.status(200).json(userInvites.requestedUsers);
  }

});

//@desc Get RequestedUsers
//@route  Get /api/users/requestedUser
//@access private

const requestedUser = asyncHandler(async (req, res) => {

  const userId = req.user.id;
  console.log('inside requested users');
  console.log(userId);
  const userIdObjectId = new mongoose.Types.ObjectId(userId);
  const userRequests = await Invite.findOne({ user_id: userIdObjectId }).populate("invitedUsers", "avatar_Id username email occupation"); // Populate invitedUsers with selected fields

  if (!userRequests) {
    res.status(404).json({ message: "User requests not found" });
  } else {
    res.status(200).json(userRequests.invitedUsers);
  }
});


//@desc Send RequestedUsers
//@route  Get /api/users/sendRequest
//@access private

const sendRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const otherUserId = req.query.id;
  console.log('inside sendRequest users');
  console.log('Inside sendRequest');
  console.log('userId:', userId);
  console.log('otherUserId:', otherUserId);

  try {

    const UserIdObjectId = new mongoose.Types.ObjectId(userId);
    const otherUserIdObjectId = new mongoose.Types.ObjectId(otherUserId);

    // Add otherUserId to requestedUsers of userId
    const userRequest = await Request.findOneAndUpdate(
      { user_id: userId },
      { $addToSet: { requestedUsers: otherUserIdObjectId } },
      { upsert: true, new: true }
    );

    // Add userId to invitedUsers of otherUserId
    const userInvite = await Invite.findOneAndUpdate(
      { user_id: otherUserId },
      { $addToSet: { invitedUsers: UserIdObjectId } },
      { upsert: true, new: true }
    );

    res.status(200).json({ userRequest, userInvite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



//@desc Get RequestedUsers
//@route  Get /api/users/requestedUser
//@access private

const withdrawRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const otherUserId = req.query.id;
  console.log('Inside withdrawRequest');

  const UserIdObjectId = new mongoose.Types.ObjectId(userId);
  const otherUserIdObjectId = new mongoose.Types.ObjectId(otherUserId);

  try {
    // Remove otherUserId from requestedUsers of userId
    const userRequest = await Request.findOneAndUpdate(
      { user_id: userId },
      { $pull: { requestedUsers: otherUserIdObjectId } },
      { new: true }
    );

    // Remove userId from invitedUsers of otherUserId
    const userInvite = await Invite.findOneAndUpdate(
      { user_id: otherUserId },
      { $pull: { invitedUsers: UserIdObjectId } },
      { new: true }
    );

    // Return the updated userRequest and userInvite objects
    res.status(200).json({ userRequest, userInvite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { registerUser, loginUser, currentUser, allUsers, invitedUser, requestedUser, sendRequest, withdrawRequest };