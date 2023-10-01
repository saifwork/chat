const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const http = require("http");
const db = require('./db.js');
const initializeSocket = require('./socket');
const bodyParser = require("body-parser");
const cors = require('cors');
const socketIo = require('socket.io');
const host = process.env.HOST;
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.json());
db.connectDb();
initializeSocket(server);

app.get('/api/test', (req,res) => {
 res.send('HII BUDDY');
});

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(errorHandler);

app.listen(port, host,() => {
    console.log(`Server running on port ${port}`);
});
