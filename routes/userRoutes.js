const express = require("express");
const router = express.Router();
const {registerUser, loginUser, currentUser, allUsers, invitedUser, requestedUser, sendRequest, withdrawRequest} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current").get(validateToken,currentUser);
router.route("/getUsers").get(allUsers);

router.route("/invitedUser").get(validateToken,invitedUser);
router.route("/requestedUser").get(validateToken,requestedUser);

router.route("/sendRequest").get(validateToken,sendRequest);
router.route("/withdrawRequest").delete(validateToken,withdrawRequest);

module.exports = router;