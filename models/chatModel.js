const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [
    {
      senderId: {
        type: String,   
        required: true,
      },
      recipientId: {
        type: String,   
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('Chat', chatSchema);
