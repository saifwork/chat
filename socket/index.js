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

      users[user._id] = socket.id;
      console.log(`User connected: ${user.username}`);

      console.log(users);



      socket.on('message', async (message) => {
        const recipientId = message.recipientId;
        const date = message.date;
        const time = message.time;
        const recipientSocket = users[recipientId];

        const newMessage = {
          senderId: user._id,
          recipientId: recipientId,
          content: message.msg,
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
        let chat = await Chat.findOne({ chatId });

        if (!chat) {
          chat = new Chat({ chatId, messages: [] });
        }

        chat.messages.push(newMessage);
        await chat.save();

      });
      // socket.on("message", (data) => {
      //   // Check if socket.user is defined before accessing its properties
      //   if (socket.user && socket.user.user._id) {
      //     console.log(`Message received from user ${socket.user.user.username}: ${data}`);

      //     // Broadcast the message to all connected clients
      //     io.emit("message", { user: socket.user.user.username, message: data });
      //   } else {
      //     console.log('User not authenticated');
      //     // Handle the case where the user is not authenticated
      //     // You can choose to disconnect the socket or handle it differently
      //   }
      // });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  });

}

module.exports = initializeSocket;
