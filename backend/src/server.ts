import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";
import { UserManager } from "./Manager/userManager";

const app = express();
const server = http.createServer(http);
const PORT = 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const user_manager = new UserManager();
io.on("connection", (socket: Socket) => {
  console.log("A user connected");
  user_manager.addUser("arjunn", socket);
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    user_manager.removeUser(socket.id);
  });
});

app.get("/", (req, res) => {
  res.send({ message: "Success" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
