const mongoose = require("mongoose");

const inviteSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Invite", inviteSchema);
