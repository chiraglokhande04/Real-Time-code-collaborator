//
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/ChatBox");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const rooms = {}; // Store all rooms and users

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // 🟢 Create Room
    socket.on("create-room", (username) => {
      const roomId = uuidv4();
      rooms[roomId] = { users: {}, content: "" };
      rooms[roomId].users[socket.id] = { id: socket.id, username };

      socket.join(roomId);
      socket.emit("room-created", roomId, rooms[roomId].content);
      console.log("🚀 Room Created:", roomId);

      io.to(roomId).emit("updateUsers", Object.values(rooms[roomId].users));
    });

    // 🟡 Join Room
    socket.on("join-room", async (username, roomId) => {
      if (!rooms[roomId]) {
        socket.emit("error", "Room Not Found");
        return;
      }

      rooms[roomId].users[socket.id] = { id: socket.id, username };
      socket.join(roomId);
      console.log(`👤 ${username} joined Room: ${roomId}`);

      socket.emit("room-joined", roomId);

      // 📥 Send chat history
      try {
        const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
        socket.emit("loadMessages", messages);
      } catch (error) {
        console.error("❌ Error loading messages:", error);
      }

      io.to(roomId).emit("updateUsers", Object.values(rooms[roomId].users));
    });

    // 🟠 Toggle Chat Open State
    socket.on("toggle", (isOpen) => {
      const roomId = rooms[socket.id];
      if (roomId && rooms[roomId]?.users[socket.id]) {
        rooms[roomId].users[socket.id].chatOpen = isOpen;
      }
    });


    // 🔄 Get Users in Room
    socket.on("get-room-users", (roomId, callback) => {
      if (rooms[roomId]) {
        callback(Object.values(rooms[roomId].users));
      } else {
        callback([]);
      }
    });

    // 📝 Handle Code Changes
    socket.on("code-change", ({ roomId, newCode }) => {
      if (rooms[roomId]) {
        rooms[roomId].content = newCode;
        socket.to(roomId).emit("update-code", newCode);
      }
    });

    // 💬 Handle Sending Messages
    socket.on("sendMessage", async ({ roomId, sender, message }) => {
      if (!roomId || !sender || !message.trim()) return;

      try {
        const chatMessage = new Chat({
          roomId,
          sender,
          message,
          timestamp: new Date(),
        });
        await chatMessage.save();

        const newMessage = {
          sender,
          message,
          timestamp: chatMessage.timestamp,
        };

        io.to(roomId).emit("newMessage", newMessage);
        // io.to(roomId).emit("chat:notification", { sender, message }); // 🔔 Emit notification
        Object.entries(rooms[roomId].users).forEach(([id, users]) => {
          if (!users.chatOpen) {
            io.to(id).emit("notification", { sender, message });
          }
        });
        console.log(`💬 Message Sent in ${roomId}: ${sender} -> ${message}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // 🔄 Get Username
    socket.on("get-username", (roomId, callback) => {
      if (rooms[roomId] && rooms[roomId].users[socket.id]) {
        callback(rooms[roomId].users[socket.id].username);
      } else {
        callback("Guest");
      }
    });

    // 🖱️ Cursor Position
    socket.on("cursor-move", ({ username, position }) => {
      socket.broadcast.emit("update-cursor", { username, position });
    });

    // ❌ Handle Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);

      Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId]?.users[socket.id]) {
          delete rooms[roomId].users[socket.id];
          io.to(roomId).emit("updateUsers", Object.values(rooms[roomId].users));

          if (Object.keys(rooms[roomId].users).length === 0) {
            delete rooms[roomId];
            console.log(`🗑️ Room ${roomId} deleted (No users left)`);
          }
        }
      });
    });
  });
};

module.exports = setupSocket;
