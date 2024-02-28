import { User } from "./userManager";

let global_id = 0;

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate();
    this.rooms.set(roomId.toString(), { user1, user2 });
    user1.socket.emit("send-new-room", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string) {
    const user2 = this.rooms.get(roomId)?.user2;
    user2?.socket.emit("offer", {
      sdp,
      roomId
    });
  }
  onAnswer(roomId: string, sdp: string) {
    const user1 = this.rooms.get(roomId)?.user1;
    user1?.socket.emit("answer", {
      sdp,
      roomId
    });
  }

  generate() {
    return global_id++;
  }
}
