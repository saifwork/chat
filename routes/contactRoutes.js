const express = require("express");
const router = express.Router();
const {getContacts, createContact, getContact, updateContact, deleteContact, addToContact, removeFromContact} = require("../controllers/contactController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);
// router.route("/").get(getContacts).post(createContact);
// router.route("/:id").get(getContact).put(updateContact).delete(deleteContact);
router.route("/addToContact").get(addToContact);
router.route("/removeFromContact").delete(removeFromContact);

module.exports = router;