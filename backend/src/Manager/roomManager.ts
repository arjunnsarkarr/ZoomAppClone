import { User } from "./userManager";

let global_id = 1;

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
    const roomId = this.generate().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });
    user2.socket.emit("send-offer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const userr = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    userr?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string ,senderSocketId :string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const userr = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    userr?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }


  onIceCandidate(roomId :string , senderSocketId : string , candidate :string , type : "sender" | "reciever" ){
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const userr = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    userr?.socket.emit("add-ice-candidate", {
      candidate,
      type,
    });
  }





  generate() {
    return global_id++;
  }
}
