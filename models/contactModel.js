const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  Users: [
    {
      uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      chatId: {
        type: String,
        required: true,
      },
    },
  ],
}, {
   timestamps: true, 
});

module.exports = mongoose.model("Contact", contactSchema);
