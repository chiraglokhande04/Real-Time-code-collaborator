const Chat = require("../models/ChatBox"); // Import Chat Model
const { v4: uuidv4 } = require("uuid");

// Fetch messages from a room
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

module.exports = { getMessages };
