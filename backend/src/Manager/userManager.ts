import { Socket } from "socket.io";
import { RoomManager } from "./roomManager";

export interface User {
  socket: Socket;
  name: String;
}

export class UserManager {
  private users: User[];
  private queue: String[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: String, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    socket.emit("lobby");
    this.clearQueue();
    this.initHandler(socket);
  }

  removeUser(socketId: String) {
    const user = this.users.find((user) => user.socket.id === socketId);
    this.users = this.users.filter((user) => user.socket.id !== socketId);
    this.queue = this.queue.filter((id) => id === socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) {
      return;
    }
    const id1 = this.queue.pop();
    const id2 = this.queue.pop();

    const user1 = this.users.find((user) => user.socket.id === id1);
    const user2 = this.users.find((user) => user.socket.id === id2);

    if (!user1 || !user2) {
      return;
    }
    const room = this.roomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandler(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });
    socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
      this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
    });
  }
}
