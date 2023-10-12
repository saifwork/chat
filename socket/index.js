const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");
const Chat = require('../models/chatModel');


const socketToRoom = new Map(); // Track Socket Room
const onlineUsers = new Set(); // Track online users

function initializeSocket(server) {
  console.log('inside Initialize Socket');
  const io = socketIo(server);

  // Socket.io Connection Handling
  io.on("connection", (socket) => {
    const token = socket.handshake.query.token;
    console.log('Received token:', token);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('Authentication error occurred:', err.message);
        return socket.disconnect();
      }

      socket.user = decoded;
      const user = socket.user.user;

      // Track the user as online
      onlineUsers.add(user._id);

      // Emit online status to connected clients
      io.emit('online-status', { userId: user._id, isOnline: true });

      // Server-side code
      socket.on('get-online-status', (data) => {
        const userIdToCheck = data.userId;
        // Check if the userIdToCheck is in the onlineUsers Set
        const isOnline = onlineUsers.has(userIdToCheck);

        // Emit the online status back to the requesting client
        socket.emit('online-status', { userId: userIdToCheck, isOnline: isOnline });
      });


      socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        // Map the socket ID to the room ID
        socketToRoom.set(socket.id, roomId);
      });

      socket.on('typing', (data) => {
        const roomId = socketToRoom.get(socket.id);
        const isTyping = data.isTyping;

        // Emit the typing status to all sockets in the room
        io.to(roomId).emit('typing', {
          userId: user._id,
          isTyping: isTyping,
        });
      });

      socket.on('message', async (message) => {
        const roomId = socketToRoom.get(socket.id);

        // Emit the message to all sockets in the room
        io.to(roomId).emit('message', message);

        // Save the message to the database
        const chatId = roomId; // Use the room ID as the chat ID
        const newMessage = {
          senderId: user._id,
          recipientId: message.recipientId,
          content: message.content,
          date: message.date,
          time: message.time,
        };

        const chat = await Chat.findOne({ chatId });

        if (!chat) {
          // Create a new chat if it doesn't exist
          const newChat = new Chat({
            chatId,
            messages: [newMessage],
          });
          await newChat.save();
        } else {
          // Add the message to the existing chat
          chat.messages.push(newMessage);
          await chat.save();
        }
      });

      socket.on('disconnect', () => {
        // Clean up when a socket disconnects
        const roomId = socketToRoom.get(socket.id);
        socket.leave(roomId);
        socketToRoom.delete(socket.id);

        // Track the user as offline
        onlineUsers.delete(user._id);

        // Emit offline status to connected clients
        io.emit('online-status', { userId: user._id, isOnline: false });
      });
    });
  });
}


module.exports = initializeSocket;
