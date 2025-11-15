import { Room, Client } from "@colyseus/core";
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import startCountdown from "../helpers/minsecondsTimer";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0.5; //-0.2;
  @type("number") z = 0;
  @type("string") username = "Guest";
}

class CordeliaCourtState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  @type("number") timeLeft: number;
  @type("string") timerString: string;

  @type("number") duration: number;
  //@type(["string"]) usernames = new ArraySchema();
}

export class CordeliaCourt extends Room<CordeliaCourtState> {
  onCreate(options: any) {
    this.maxClients = 2;
    // this.setState(new CordeliaCourtState())
    this.state = new CordeliaCourtState();
    // console.log("Room created ", this.roomId);
    // console.log("Custom name", options.custom_name);
    // console.log("Date limit duration ", options.expires);
    this.roomId = options.roomId || this.roomId; // store unique session ID
    this.state.duration = options.timer || 0;
    console.log("CordeliaCourt Room created with ID:", this.roomId);
    console.log("Duration: ", this.state.duration);
    console.log("Members: ", options.members);

    this.state.timeLeft = this.state.duration; //+options.expires;
    console.log("Timeleft: ", this.state.timeLeft);

    this.onMessage("positionUpdate", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
      }
    });

    // this.onMessage("move", (client, data) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (player) {
    //     player.x = data.x;
    //     player.y = data.y;
    //     player.z = data.z;
    //   }
    //   //  console.log(`playerMoved [${(player.x, player.y, player.z)}]`);
    //   this.broadcast("playerMoved", {
    //     sessionId: client.sessionId,
    //     x: player.x,
    //     y: player.y,
    //     z: player.z,
    //   });
    // });

    this.onMessage("peer-id", (client, message) => {
      // Broadcast PeerJS ID to other client
      this.clients.forEach((c) => {
        if (c.sessionId !== client.sessionId) {
          c.send("peer-id", message);
        }
      });
    });

    this.onMessage("chat", (client, message) => {
      // broadcast chat message to everyone
      this.broadcast("chat", { from: client.sessionId, text: message });
    });

    this.autoDispose = true;
  } // onCreate

  onJoin(client: Client, options: any) {
    // Enforce 2-player limit
    // if (this.clients.length > 2) {
    //   console.log("Room full, rejecting client:", client.sessionId);
    //   client.leave(4000, "Room is full (max 2 users).");

    //   return;
    // }
    if (this.state.players.size >= 2) {
      console.log("Room full, rejecting client:", client.sessionId);
      this.state.players.delete(client.sessionId); // is this necessary?
      client.leave(4000, "Room is full (max 2 users).");
      // client.leave();
      return;
    } else {
      const player = new Player();
      player.username = `user_${client.sessionId}`;
      console.log(
        "Client joined:",
        JSON.stringify(player),
        "options:",
        options
      );
      this.state.players.set(client.sessionId, player);

      this.broadcast("playerJoined", client.sessionId);
      if (this.clients.length === 2) {
        this.broadcast("startDate", this.state.timeLeft);
        console.log("Starting date for timer ", this.state.timeLeft);
        //  this.state.timerString = startCountdown(this.state.timeLeft);
        //  this.broadcast("players", (client.sessionId, this.state.usernames));
      }
    }

    // Each client can pass their own username
    //const username = options.currentUser;
    //console.log(username, "joined room", this.roomId);
    // console.log(
    //   `${username} joined room ${this.roomId} with sessionID: ${client.sessionId}`
    // );

    // const player = new Player();
    // player.username = username;
    // this.state.players.set(client.sessionId, player);
    //this.state.players.set(client.sessionId, new Player());
  } // onJoin

  onLeave(client: Client, consented: boolean) {
    console.log("Client left:", client.sessionId);
    this.state.players.delete(client.sessionId);

    // this.broadcast("playerLeft", client.sessionId);
  }

  //   onLeave(client) {
  //   this.state.players.delete(client.sessionId);

  //   if (this.clients.length === 0) {
  //     // Schedule disposal after 30 seconds
  //     this.clock.setTimeout(() => {
  //       if (this.clients.length === 0) {
  //         this.disconnect();
  //         this.dispose();
  //       }
  //     }, 30000);
  //   }
  // }

  onDispose() {
    console.log("Disposing empty room..");
    // this.broadcast("disposed", "Disposing empty room..");
  }
}
