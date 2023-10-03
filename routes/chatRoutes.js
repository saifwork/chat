const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {getChat} = require("../controllers/chatController");


router.route("/getChats").get(validateToken,getChat);

module.exports = router;