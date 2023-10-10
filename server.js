// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();
const db = require("./db.js");
const errorHandler = require("./middleware/errorHandler");
const host = process.env.HOST;
const port = process.env.PORT || 4000;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
(async () => {
  try {
    await db.connectDb();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the application if the database connection fails
  }
})();

// API Routes
app.get("/api/test", (req, res) => {
  res.send("HII BUDDY");
});

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes.js"));

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
