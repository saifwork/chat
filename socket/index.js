const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const Chat = require('../models/chatModel');

const users = {};

function initializeSocket(server) {

  console.log('inside Initialize Socket');
  const io = socketIo(server);

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.user = decoded;

      next();
    });
  });

  io.on('connection', async (socket) => {

    console,log('A user connected');
    const user = socket.user;

    const email = user.email;
    const instance = await User.findOne({ email });

    if (!instance) {
      console.log('User information missing or invalid');
      socket.disconnect(true);
      return;
    }

    // Store the socket for the user
    users[user.id] = socket.id;

    console.log(`User connected: ${user.username}`);

    socket.on('sendOneToOneMessage', async (message) => {
      const recipientId = message.recipientId;
      const recipientSocket = users[recipientId];

      if (recipientSocket) {
        // Send the message to the recipient
        recipientSocket.emit('receiveOneToOneMessage', message.msg);
        console.log(`Message sent from ${user.username} to ${recipientSocket.user.username}`);
      } else {
        console.log(`Recipient with ID ${recipientId} not found`);
      }

    const chatId = [user._id, recipientId].sort().join('');
    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      chat = new Chat({ chatId, messages: [] });
    }

    const newMessage = {
      senderId: user._id,
      recipientId: recipientId,
      content: message.content,
      timestamp: new Date(),
    };
    chat.messages.push(newMessage);
    await chat.save();
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username}`);
      // Remove the socket from the users object
      delete users[user.id];
    });

  });
}

module.exports = initializeSocket;
