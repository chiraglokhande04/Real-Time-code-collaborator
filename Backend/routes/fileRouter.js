const express = require("express");
const router = express.Router();
const multer = require("multer");
 const { uploadFile, renameFile, deleteFile, getTree } = require("../controllers/FileController");
//const { uploadFile} = require("../controllers/fileController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.array("files"), uploadFile);
router.patch("/rename/:id", renameFile);
router.delete("/:id", deleteFile);
router.get("/tree/:roomId", getTree);

module.exports = router;