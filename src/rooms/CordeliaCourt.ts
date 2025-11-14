import { Room, Client } from "@colyseus/core";
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import startCountdown from "../helpers/minsecondsTimer";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0.5; //-0.2;
  @type("number") z = 0;
}

class CordeliaCourtState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  @type("number") timeLeft: number;
  @type("string") timerString: string;
  @type("string") bookedDate: string;
  @type("string") bookedTime: string;
  @type("number") duration: number;
  @type(["string"]) usernames = new ArraySchema();
}

export class CordeliaCourt extends Room<CordeliaCourtState> {
  maxClients = 2;
  state = new CordeliaCourtState();

  onCreate(options: any) {
    // console.log("Room created ", this.roomId);
    // console.log("Custom name", options.custom_name);
    // console.log("Date limit duration ", options.expires);
    this.roomId = options.roomId; // store unique session ID
    this.state.duration = options.duration;
    this.state.usernames = options.usernames;
    this.state.bookedDate = options.date;
    this.state.bookedTime = options.time;
    console.log("CordeliaCourt Room created with ID:", this.roomId);
    console.log("Duration: ", this.state.duration);
    console.log("bookedDate: ", this.state.bookedDate);
    console.log("bookedTime: ", this.state.bookedTime);
    console.log("Usernames: ", this.state.usernames);
    this.state.timeLeft = this.state.duration; //+options.expires;
    console.log("Timeleft: ", this.state.timeLeft);

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

    this.onMessage("cubeTouch", (client, data) => {
      this.broadcast("cubeTouch", data);
    });

    this.onMessage("peer-id", (client, message) => {
      // Broadcast PeerJS ID to other client
      this.clients.forEach((c) => {
        if (c.sessionId !== client.sessionId) {
          c.send("peer-id", message);
        }
      });
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
      //  this.state.timerString = startCountdown(this.state.timeLeft);
      this.broadcast("players", this.clients.length);
    }
  } // onJoin

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    this.broadcast("playerLeft", client.sessionId);
  }

  onDispose() {
    this.broadcast("disposed", "Disposing empty room..");
  }
}
