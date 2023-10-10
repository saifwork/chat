// index.js
const http = require("http");
const app = require("./server");
const initializeSocket = require("./socket");

const server = http.createServer(app);
const port = process.env.PORT || 4000;


initializeSocket(server);

// Start the Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
