const express = require('express');
const http = require('http');  // Required for Socket.IO
require('dotenv').config();
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const setupSocket = require('./config/socket'); 
const app = express();
const server = http.createServer(app); // Creating HTTP server

const cors = require("cors");
app.use(cors());


const { exec } = require("child_process");

app.use(session({
  secret: "YOUR_SECRET_KEY",  // Change this to a strong, random key
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passportSetup');

app.use(express.json());

// Routes
app.use('/auth', require('./routes/authRouter'));

app.post("/run-python", (req, res) => {
  const code = req.body.code;
  console.log("Received Python code:", code);
  
  if (!code) {
      return res.status(400).json({ error: "No code provided." });
  }

  // Execute Python code
  exec(`python3 -c "${code.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
      if (error) {
          return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout });
  });
});

// Initialize Socket.IO
setupSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(3000, () => { // Use server instead of app.listen
      console.log('Server is running on port 3000');
    });

  } catch (err) {
    console.log('Error in starting server or connecting DB', err);
  }
};

startServer();
