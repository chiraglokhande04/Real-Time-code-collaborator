### 📝 Real-Time Collaborative Code Editor
A real-time collaborative code editor built with React, Yjs, and Socket.IO that allows multiple users to edit code together seamlessly.
It supports folder & file syncing, per-character real-time collaboration, and cloud storage integration for persistent file saving.

---
### 🔗 Live Demo  
👉 https://real-time-code-collaborator-one.vercel.app/  

---

### 🚀 Features
```
Real-time collaboration – Multiple users can edit the same file simultaneously.
Yjs-powered synchronization – Efficient CRDT-based syncing of documents.
Folder & file system support – Create, update, and sync project structure across clients.
Cloud storage integration – Save files to Cloudinary via REST API with a single click.
Per-character updates – Low-latency text synchronization.
Socket.IO transport layer – Lightweight signaling without y-websocket.
Scalable architecture – Works across multiple clients with minimal conflicts.
```

---

### 🏗️ Architecture
```
Frontend (React)  
   │
   ├── Uses Yjs for shared state (documents + metadata)  
   ├── Connects to backend via Socket.IO  
   │
Backend (Node.js + Express)  
   ├── Manages Yjs document updates  
   ├── Handles folder/file metadata sync  
   ├── Provides REST API for saving files  
   │
Cloud Storage (Cloudinary)
   └── Stores file contents persistently
```

---

### ⚙️ Tech Stack
```
Frontend: React, Yjs
Backend: Node.js, Express, Socket.IO, child-process (for embeddings if needed)
Storage: Cloudinary (for files), in-memory Yjs docs (for real-time state)
Collaboration Engine: Yjs (CRDT-based real-time syncing)
```
---

### 📂 Project Structure
```
/project-root
│── /frontend       # React frontend
│── /backend       # Node.js + Express + Socket.IO backend
│── README.md     # Project documentation
```

---

### 🔧 Installation & Setup
**1. Clone the repository**
```
git clone https://github.com/your-username/realtime-code-editor.git
cd realtime-code-editor
```

**2. Install dependencies**
**Backend**
```
cd server
npm install
```
**Frontend**
```
cd client
npm install
```

**3. Environment Variables**
**Create .env in /server:**
```
PORT=5000
CLOUDINARY_URL=your_cloudinary_url
```
---

### ▶️ Running the Project
**Start Backend**
```
cd backend
npm start
```
**Start Frontend**
```
cd frontend
npm run dev
```
Visit: http://localhost:3000

--- 

### 💾 Saving Files
```
Click Save in the editor → Backend receives file content → Uploads to Cloudinary.
Files are versioned and can be restored later.
```
---

### 🤝 Contribution

Contributions are welcome!
```
Fork the repo
Create a feature branch (git checkout -b feature/awesome-feature)
Commit changes (git commit -m "Add awesome feature")
Push to branch (git push origin feature/awesome-feature)
Open a Pull Request
```


