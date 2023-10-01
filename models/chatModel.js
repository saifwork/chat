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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true,
      },
      recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Chat', chatSchema);
