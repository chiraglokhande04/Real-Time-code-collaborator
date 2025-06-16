const mongoose = require("mongoose");


const ChatSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    }
  });

const roomSchema = new mongoose.Schema({
    roomId:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    chatHistory: [ChatSchema],
    folder: {
      default: {
        type: String, // file name, e.g. "default.js"
        default: "default.js",
      },
      content: {
        type: String, // code content of the file
        default: "// Default JavaScript code",
      },
      type: {
        type: String,
        default: "javascript",
      },
      lastModified: {
        type: Date,
        default: Date.now,
      },
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Room", roomSchema);