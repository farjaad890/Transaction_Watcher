const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const { updateBlocks } = require("./functions");

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

const addressRouter = require("./model/addresscontroler");
app.use("/address", addressRouter);
// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
