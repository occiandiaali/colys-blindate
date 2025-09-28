import { Room, Client } from "@colyseus/core";

import { MapSchema, Schema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0.3;
  @type("number") z = 0;
}

class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") timeLeft: number;
}

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;
  peerConnection: any;

  state = new MyRoomState();
  onCreate(options: any) {
    // console.log("Room created ", this.roomId);
    // console.log("Custom name", options.custom_name);
    // console.log("Date limit duration ", options.expires);

    this.state.timeLeft = +options.expires;

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
      }
      //  console.log(`playerMoved [${(player.x, player.y, player.z)}]`);
      this.broadcast("playerMoved", {
        sessionId: client.sessionId,
        x: player.x,
        y: player.y,
        z: player.z,
      });
    });

    this.onMessage("voice-offer", (client, data) => {
      const target = this.clients.find((c) => c.sessionId === data.to);
      if (target) {
        target.send("voice-offer", {
          from: client.sessionId,
          offer: data.offer,
        });
      }
    });

    this.onMessage("voice-answer", (client, data) => {
      const target = this.clients.find((c) => c.sessionId === data.to);
      if (target) {
        target.send("voice-answer", {
          from: client.sessionId,
          answer: data.answer,
        });
      }
    });

    this.onMessage("ice-candidate", (client, data) => {
      const target = this.clients.find((c) => c.sessionId === data.to);
      if (target) {
        target.send("ice-candidate", {
          from: client.sessionId,
          candidate: data.candidate,
        });
      }
    });

    this.onMessage("chat", (client, data) => {
      this.broadcast("chat", data);
    });
  }

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());

    this.broadcast("playerJoined", client.sessionId);

    if (this.clients.length === 2) {
      this.broadcast("startDate", this.state.timeLeft);
      this.broadcast("players", this.clients.length);
    }
  } // onJoin

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    this.broadcast("playerLeft", client.sessionId);
  }

  onDispose() {
    this.broadcast("disposing", "Disposing empty Black Ground room..");
  }
}
