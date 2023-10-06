const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const db = require("./db.js");
const initializeSocket = require("./socket");
const errorHandler = require("./middleware/errorHandler");
const jwt = require('jsonwebtoken');
const host = process.env.HOST;
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection

// Socket.io Initialization
initializeSocket(server);
  
// API Routes
app.get("/api/test", (req, res) => {
  res.send("HII BUDDY");
});

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes.js"));


// Error Handling Middleware
app.use(errorHandler);

// Start the Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  db.connectDb();
});
