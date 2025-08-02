const mongoose = require("mongoose");

const CodeRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  code: { type: String, default: "" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
});

module.exports = mongoose.model("CodeRoom", CodeRoomSchema);
