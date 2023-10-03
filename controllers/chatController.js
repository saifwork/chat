const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Chat = require('../models/chatModel');

const getChat = asyncHandler(async (req, res) => {
    const chatId = req.query.id;
    console.log(chatId);
    try {
        const chat = await Chat.findOne({ chatId: chatId }); // Use findOne to get a single chat
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        console.log(chat.messages);
        res.status(200).json(chat.messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = { getChat };