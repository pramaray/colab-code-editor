const mongoose = require("mongoose");

const CodeRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // Add this
  code: { type: String, default: "" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true }); // Optional: adds createdAt, updatedAt


module.exports = mongoose.model("CodeRoom", CodeRoomSchema);
