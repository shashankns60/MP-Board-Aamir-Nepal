const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const root = __dirname;
const busyPage = path.join(root, "404.html");
const port = Number(process.env.PORT) || 5501;

app.use(express.static(root, { extensions: ["html", "htm"] }));

app.use((req, res) => {
  if (fs.existsSync(busyPage)) {
    res.status(503).sendFile(busyPage);
    return;
  }
  res.status(503).send("Server Busy");
});

app.listen(port, () => {
  console.log(`MPBSE site running at http://127.0.0.1:${port}/`);
  console.log("Missing pages show Server Busy (404.html).");
});
