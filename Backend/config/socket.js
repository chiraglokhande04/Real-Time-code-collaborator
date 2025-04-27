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

      io.to(roomId).emit("update-users", Object.values(rooms[roomId].users));
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

      io.to(roomId).emit("update-users", Object.values(rooms[roomId].users));
    });

    // 🟠 Toggle Chat Open State
    socket.on("toggle", (isOpen) => {
      const roomId = userRoomMap[socket.id];
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




    const roomFiles = new Map();

    // When a user uploads files
    socket.on("share-files", ({ roomId, files }) => {
      // Store the files for this room
      if (!roomFiles.has(roomId)) {
        roomFiles.set(roomId, []);
      }

      // Update existing files or add new ones
      const existingFiles = roomFiles.get(roomId);

      files.forEach(newFile => {
        const existingIndex = existingFiles.findIndex(f => f.name === newFile.name);
        if (existingIndex >= 0) {
          existingFiles[existingIndex] = newFile;
        } else {
          existingFiles.push(newFile);
        }
      });

      // Save updated files
      roomFiles.set(roomId, existingFiles);

      // Broadcast to all other users in the room
      socket.to(roomId).emit("receive-files", existingFiles);
    });

    // When a user requests room files
    socket.on("get-room-files", (roomId) => {
      if (roomFiles.has(roomId)) {
        socket.emit("receive-files", roomFiles.get(roomId));
      }
    });

    // 📝 Handle Code Changes
    socket.on("code-change", ({ roomId, newCode, fileName }) => {
      if (rooms[roomId]) {
        rooms[roomId].content = newCode;
        if (fileName && roomFiles.has(roomId)) {
          const files = roomFiles.get(roomId);
          const fileIndex = files.findIndex(f => f.name === fileName);

          if (fileIndex >= 0) {
            files[fileIndex].content = newCode;
            roomFiles.set(roomId, files);
          }
        }
        socket.to(roomId).emit("update-code", { newCode, fileName });
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
        io.to(roomId).emit("chat:notification", { sender, message }); // 🔔 Emit notification
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



    // Handle offer and answer signaling
    socket.on("offer", (data) => {
      socket.to(data.target).emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.to(data.target).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.target).emit("ice-candidate", data);
    });

    // ❌ Handle Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);

      Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId]?.users[socket.id]) {
          delete rooms[roomId].users[socket.id];
          io.to(roomId).emit("update-users", Object.values(rooms[roomId].users));

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
