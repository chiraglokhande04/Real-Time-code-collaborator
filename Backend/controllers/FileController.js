const File = require("../models/File");
const cloudinary = require("../config/upload");
const Room = require("../models/Room");

exports.uploadFile = async (req, res) => {
    try {
        const files = req.files;
        const { roomId } = req.body;

        const folderMap = {}; // Map folder path => folder document ID

        const room = await Room.findOne({ roomId }); // finds room where roomId (string) matches
        if (!room) return res.status(404).json({ message: "Room not found" });



    for (const file of files) {
            const relativePath = file.originalname || file.originalname;
            const webkitPath = file.webkitRelativePath || relativePath;
            const fullPath = webkitPath || file.originalname;

            const pathParts = fullPath.split("/"); // e.g., ['MyProject', 'scripts', 'app.js']
            const fileName = pathParts.pop();      // 'app.js'

            let currentParentId = null;
            let currentPath = "";

            // Create folder hierarchy if not already
            for (const part of pathParts) {
                currentPath += (currentPath ? "/" : "") + part;

                if (!folderMap[currentPath]) {
                    const newFolder = await File.create({
                        name: part,
                        type: "folder",
                        path: currentPath,
                        parentId: currentParentId,
                        roomId: room._id,
                    });

                    folderMap[currentPath] = newFolder._id;
                    currentParentId = newFolder._id;

                    global._io.to(roomId).emit("folderCreated", newFolder);
                } else {
                    currentParentId = folderMap[currentPath];
                }
            }

            // Upload file to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });

            const uploadedFile = await File.create({
                name: fileName,
                type: "file",
                path: fullPath,
                parentId: currentParentId,
                roomId: room._id,
                cloudinaryPublicId: uploadResult.public_id,
                url: uploadResult.secure_url,
            });

            global._io.to(roomId).emit("fileUploaded", uploadedFile);
        }

        res.status(200).json({ message: "Uploaded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
};





// exports.renameFile = async (req, res) => {
//     const { id } = req.params;
//     const { newName, roomId } = req.body;
//     const updated = await File.findByIdAndUpdate(id, { name: newName }, { new: true });
//     global._io.to(roomId).emit("fileRenamed", updated);
//     res.json(updated);
//   };
  
exports.renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName, roomId } = req.body;

    const updated = await File.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "File not found" });
    }

    // Notify clients about renamed file
    global._io.to(roomId).emit("fileRenamed", updated);
    res.json(updated);
  } catch (err) {
    console.error("Rename failed:", err);
    res.status(500).json({ message: "Rename failed" });
  }
};

  // exports.deleteFile = async (req, res) => {
  //   const { id } = req.params;
  //   const file = await File.findById(id);
  
  //   if (file.type === "file") {
  //     await cloudinary.uploader.destroy(file.cloudinaryPublicId);
  //   }
  
  //   await File.deleteOne({ _id: id });
  //   global._io.to(file.roomId).emit("fileDeleted", id);
  //   res.json({ message: "Deleted" });
  // };
  
  const deleteFolderRecursively = async (folderId, roomId) => {
    const children = await File.find({ parentId: folderId });
  
    for (const child of children) {
      if (child.type === "folder") {
        await deleteFolderRecursively(child._id, roomId);
      } else {
        if (child.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(child.cloudinaryPublicId);
        }
        await File.deleteOne({ _id: child._id });
        global._io.to(roomId).emit("fileDeleted", child._id);
      }
    }
  
    await File.deleteOne({ _id: folderId });
    global._io.to(roomId).emit("fileDeleted", folderId);
  };
  
  exports.deleteFile = async (req, res) => {
    try {
      const { id } = req.params;
      const file = await File.findById(id);
  
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
  
      if (file.type === "folder") {
        await deleteFolderRecursively(file._id, file.roomId);
      } else {
        if (file.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(file.cloudinaryPublicId);
        }
  
        await File.deleteOne({ _id: file._id });
        global._io.to(file.roomId).emit("fileDeleted", file._id);
      }
  
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error("Delete failed:", err);
      res.status(500).json({ message: "Delete failed" });
    }
  };
  

  // exports.getTree = async (req, res) => {
  //   const { roomId } = req.params;
  //   const room = Room.findById(roomId);
  //   if (!room) {
  //     return res.status(404).json({ message: "Room not found" });
  //   }
  //   RoomId = room._id; // Ensure roomId is an ObjectId for MongoDB queries
  //   const files = await File.find({ RoomId });
  //   res.json(files);
  // };
  

  exports.getTree = async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId);
  
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
  
      const files = await File.find({ roomId: room._id });
      res.json(files);
    } catch (err) {
      console.error("Get tree failed:", err);
      res.status(500).json({ message: "Failed to fetch tree" });
    }
  };
  