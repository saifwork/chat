const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    Users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
   timestamps: true, 
});


module.exports = mongoose.model("Contact", contactSchema);