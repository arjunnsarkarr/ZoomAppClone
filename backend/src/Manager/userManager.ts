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
    this.users.push({ socket, name });
    this.queue.push(socket.id);
    this.clearQueue();
    this.initHandler(socket)
  }

  removeUser(socketId: String) {
    this.users = this.users.filter((user) => user.socket.id !== socketId);
    this.queue = this.queue.filter((id) => id === socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) {
      return;
    }
    const user1 = this.users.find(
      (user) => user.socket.id === this.queue.pop()
    );
    const user2 = this.users.find(
      (user) => user.socket.id === this.queue.pop()
    );
    if (!user1 || !user2) {
      return;
    }
    const room = this.roomManager.createRoom(user1, user2);
  }

  initHandler(socket: Socket) {
    socket.on("offer", (sdp: string, roomId: string) => {
      this.roomManager.onOffer(roomId, sdp);
    });

    socket.on("answer", (sdp: string, roomId: string) => {
      this.roomManager.onAnswer(roomId, sdp);
    });
  }
}
