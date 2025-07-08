const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder"], required: true },
  path: { type: String, required: true }, // New: full relative path
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "File", default: null },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  cloudinaryPublicId: { type: String },
  url: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);