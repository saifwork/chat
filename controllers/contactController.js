const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
const Chat = require('../models/chatModel');
const mongoose = require('mongoose');

//@desc Get all contacts
//@route  GET /api/contacts
//@access private

const getContacts = asyncHandler(async (req,res) => {

    const contacts = await Contact.find({user_id: req.user.id});
    res.status(200).json(contacts);
});

//@desc Get contact
//@route  Get /api/contacts/:id
//@access private

const getContact = asyncHandler(async (req,res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }
    res.status(200).json(contact);
});

//@desc Create new contact
//@route  POST /api/contacts
//@access private

const createContact = asyncHandler(async (req,res) => {
    const {name, email, phone} = req.body;
    if(!name || !email || !phone){
        res.status(400);
        throw new Error("All fields are mandetory");
    }
    const contact = await Contact.create({
        user_id: req.user.id,
        name,
        email,
        phone,
    });
    res.status(201).json(contact);
});

//@desc Update new contact
//@route  PUT /api/contacts/:id
//@access private

const updateContact = asyncHandler(async (req,res) => {
    const contact = await Contact.findById(req.params.id);

    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }

    if(contact.user_id.toString() !== req.user.id){
        res.status(403);
        throw new Error("User doesn't have permission to update another user contact");
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new:true },
    );

    res.status(200).json(updatedContact);
});

//@desc Delete new contact
//@route  Delete /api/contacts/:id
//@access public

const deleteContact = asyncHandler(async (req,res) => {

    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }

    if(contact.user_id.toString() !== req.user.id){
        res.status(403);
        throw new Error("User doesn't have permission to update another user contact");
    }

    await Contact.deleteOne({_id: req.params.id});
    res.status(200).json(contact);
});


const addToContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.query.id;
  
    try {
    const chatId = [userId, otherUserId].sort().join('');
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const otherUserIdObjectId = new mongoose.Types.ObjectId(otherUserId);

      let user = await Contact.findOneAndUpdate(
        { user_id: userId },
        { $addToSet: { Users: otherUserIdObjectId } },
        { new: true, upsert: true }
      );
  
      let otherUser = await Contact.findOneAndUpdate(
        { user_id: otherUserId },
        { $addToSet: { Users: userIdObjectId } },
        { new: true, upsert: true }
      );

      const chat = new Chat({
        chatId,
        messages: [],
      });
    
      await chat.save();
  
      res.status(200).json({ user, otherUser });
    } catch (error) {
      console.log(error.toString());
      res.status(500).json({ message: "Server error" });
    }
  });
  

  const removeFromContact = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.query.id;
  
    try {

        const UserIdObjectId = new mongoose.Types.ObjectId(userId);
        const otherUserIdObjectId = new mongoose.Types.ObjectId(otherUserId);

      // Remove otherUserId from the Users array of userId
      const user = await Contact.findOneAndUpdate(
        { user_id: userId },
        { $pull: { Users: otherUserIdObjectId } },
        { new: true }
      );
  
      // Remove userId from the Users array of otherUserId
      const otherUser = await Contact.findOneAndUpdate(
        { user_id: otherUserId },
        { $pull: { Users: UserIdObjectId } },
        { new: true }
      );
  
      res.status(200).json({ user, otherUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  


module.exports = {getContacts, createContact, getContact, updateContact, deleteContact, addToContact, removeFromContact};