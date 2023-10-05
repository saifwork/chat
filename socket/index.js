const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const Chat = require('../models/chatModel');

const users = {};

function initializeSocket(server) {

  console.log('inside Initialize Socket');
  const io = socketIo(server);

  // Socket.io Connection Handling
  io.on("connection", (socket) => {
    const token = socket.handshake.query.token;
    console.log('Received token:', token);

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('Authentication error occurred:', err.message);
        // Handle authentication error
        return socket.disconnect();
      }

      socket.user = decoded;
      const user = socket.user.user;

      // users[user._id] = socket.id;

      users[user._id] = {
        socketId: socket.id,
        isOnline: true,
        isTyping: false,
      };

      const userId = user._id;

      // Emit this as a user connected to the Socket
      io.emit('online-status', { userId, isOnline: true });

      // Listen for the "typing" event from the client
      socket.on("typing", (data) => {
        const recipientId = data.recipientId;
        const isTyping = data.isTyping;

        // Find the recipient's socket based on their userId
        const recipientSocket = users[recipientId]?.socketId;

        const information = {
          userId: userId,
          isTyping: isTyping,
        };

        if (recipientSocket) {
          // Send the message to the recipient
          recipientSocket.emit('typing', information);
          console.log(`${user.username} is Typing for ${userId}`);
        } else {
          console.log(`Recipient with ID ${recipientId} not found`);
        }
      }); 

      socket.on('message', async (message) => {
        const recipientId = message.recipientId;
        const date = message.date;
        const time = message.time;
        const recipientSocket = users[recipientId]?.socketId;

        const newMessage = {
          senderId: userId,
          recipientId: recipientId,
          content: message.content,
          date: date,
          time: time,
        };

        if (recipientSocket) {
          // Send the message to the recipient
          recipientSocket.emit('message', newMessage);
          console.log(`Message sent from ${user.username} to ${recipientSocket.user.username}`);
        } else {
          console.log(`Recipient with ID ${recipientId} not found`);
        }

        // Save chat to Db
        const chatId = [user._id, recipientId].sort().join('');
        console.log(chatId);
        console.log(newMessage);
        let chat = await Chat.findOne({ chatId });

        if (!chat) {
          chat = new Chat({ chatId, messages: [] });
        }

        chat.messages.push(newMessage);
        await chat.save();

      });

      socket.on("disconnect", () => {
        delete users[userId];

        io.emit("online-status", { userId, isOnline: false });

        console.log("A user disconnected");
      });

    });
  });

}

module.exports = initializeSocket;
