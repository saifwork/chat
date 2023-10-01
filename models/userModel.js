const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    avatar_Id: {
        type: Number,
        required: [true, "Avatar Id is required"],
    },    
    username: {
        type: String,
        required: [true, "Please add the username"],
    },
    occupation: {
        type: String,
        required: [false]
    },
    email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true, "Email address already exist"]
    },
    password: {
        type: String,
        required: [true, "Please add the user password"],
    },

}, {
   timestamps: true, 
});


module.exports = mongoose.model("User", userSchema);