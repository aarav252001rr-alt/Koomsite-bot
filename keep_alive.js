// keep_alive.js - Replit pe bot 24/7 chalane ke liye
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("koom.site Bot is alive! 🚀");
});

server.listen(3000, () => {
  console.log("Keep-alive server port 3000 pe chal raha hai");
});

module.exports = server;
