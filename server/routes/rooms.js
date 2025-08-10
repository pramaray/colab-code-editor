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
function generateRoomCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 9; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6)}`;
}


// Get all rooms user is part of
router.get("/my", authenticate, async (req, res) => {
  const user = await User.findById(req.userId).populate("rooms");
  res.json(user.rooms);
});

// Create a new room
// router.post("/create", authenticate, async (req, res) => {
//   let { roomId } = req.body;
//   try {
//     let room = await CodeRoom.findOne({ roomId }); 
//     if (room) return res.status(400).json({ error: "Room already exists" });
//     room = new CodeRoom({ roomId, users: [req.userId] });
//     await room.save();
//     await User.findByIdAndUpdate(req.userId, { $push: { rooms: room._id } });
//     res.json(room);
//   } catch (err) {
//     res.status(500).json({ error: "Room creation failed" });
//   }
// });
router.post("/create", authenticate, async (req, res) => {
  const { name } = req.body;
  const roomId = generateRoomCode(); // now generated automatically

  try {
    const existing = await CodeRoom.findOne({ roomId });
    if (existing) return res.status(400).json({ error: "Room code already in use, try again" });

    const room = new CodeRoom({
      roomId,
      name,
      users: [req.userId]
    });

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

router.patch("/:roomId", authenticate, async (req, res) => {
  const { name } = req.body;
  const room = await CodeRoom.findById(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  room.name = name;
  await room.save();
  res.json({ name: room.name });
});

// DELETE room by ID
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const room = await CodeRoom.findByIdAndDelete(id); // use _id
    if (!room) return res.status(404).json({ error: "Room not found" });

    await User.updateMany(
      { rooms: room._id },
      { $pull: { rooms: room._id } }
    );

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Delete Room Error:", err);
    res.status(500).json({ error: "Failed to delete room" });
  }
});
// GET room info by roomId
router.get("/info/:roomId", async (req, res) => {
  try {
    const room = await CodeRoom.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ name: room.name || "Unnamed Room", roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch room info" });
  }
});

router.get("/:roomId/users", authenticate, async (req, res) => {
  try {
    const room = await CodeRoom.findOne({ roomId: req.params.roomId })
      .populate("users", "username name email");
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.json(room.users.map(u => ({
      _id: u._id,
      username: u.username || u.name || u.email,
      active: false
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
