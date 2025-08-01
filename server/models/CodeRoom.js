const mongoose = require("mongoose");

const CodeRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  code: { type: String, default: "" },
});

module.exports = mongoose.model("CodeRoom", CodeRoomSchema);
