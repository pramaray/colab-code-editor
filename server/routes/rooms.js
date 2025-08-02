const express = require("express");
const router = express.Router();
const CodeRoom = require("../models/CodeRoom");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
//const { v4: uuidv4 } = require("uuid");

function authenticate(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
}

// Get all rooms user is part of
router.get("/my", authenticate, async (req, res) => {
  const user = await User.findById(req.userId).populate("rooms");
  res.json(user.rooms);
});

// Create a new room
router.post("/create", authenticate, async (req, res) => {
  let { roomId } = req.body;
  try {
    let room = await CodeRoom.findOne({ roomId }); 
    if (room) return res.status(400).json({ error: "Room already exists" });
    room = new CodeRoom({ roomId, users: [req.userId] });
    await room.save();
    await User.findByIdAndUpdate(req.userId, { $push: { rooms: room._id } });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Room creation failed" });
  }
});

// Join existing room
router.post("/join", authenticate, async (req, res) => {
  const { roomId } = req.body;
  const room = await CodeRoom.findOne({ roomId });
  
  if (!room) return res.status(404).json({ error: "Room not found" });

  if (!room.users.includes(req.userId)) {
    room.users.push(req.userId);
    await room.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { rooms: room._id } });
  }

  res.json(room);
});

module.exports = router;
