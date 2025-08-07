import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;


export async function uploadToCloudinary(files, roomId) {
  const formData = new FormData();

  const paths = [];
  // ✅ Append each file separately
  files.forEach((file) => {
    formData.append("files", file); // 🔸 Matches multer's `upload.array("files")`
    paths.push(file.webkitRelativePath); // 👈 capture path
  });

  formData.append("roomId", roomId);
  formData.append("paths", JSON.stringify(paths)); // 👈 pass as JSON string

  

  try {
    const response = await axios.post(`${apiUrl}/api/files/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
}
