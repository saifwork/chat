const mongoose = require("mongoose");

const requestSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    requestedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Request", requestSchema);
