import { Room, Client, Delayed } from "@colyseus/core";
import { MapSchema, Schema, type } from "@colyseus/schema";
//import { countdown } from "../../../frontend/src/utils/millisToMinsAndSecs";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0.25;
  @type("number") z = 0;
}

class GreenRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  //@type("number") timeLeft = 300000;
  @type("number") timeLeft: number;
}

export class GreenRoom extends Room<GreenRoomState> {
  maxClients = 2;
  // delayedInterval!: Delayed;
  // countdownInterval: Delayed;
  // timerDisplay: string;
  // count: NodeJS.Timeout;
  public countdownInterval: any;

  state = new GreenRoomState();
  onCreate(options: any) {
    console.log("Room created ", this.roomId);
    console.log("Custom name", options.custom_name);
    console.log("Date limit duration ", options.expires);
    this.state.timeLeft = +options.expires;
    console.log("Timer", this.state.timeLeft);

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.z = data.z;
      }
      console.log(`playerMoved [${(player.x, player.y, player.z)}]`);
      this.broadcast("playerMoved", {
        sessionId: client.sessionId,
        x: player.x,
        y: player.y,
        z: player.z,
      });
    });

    this.onMessage("offer", (client, offer) => {
      this.broadcast("offer", offer, { except: client });
    });

    this.onMessage("answer", (client, answer) => {
      this.broadcast("answer", answer, { except: client });
    });

    this.onMessage("ice", (client, candidate) => {
      this.broadcast("ice", candidate, { except: client });
    });
  }

  // Countdown(ms: number) {
  //   this.state.timeLeft = ms;

  //   this.clock.setInterval(() => {
  //     if (this.state.timeLeft > 0) {
  //       console.log(`Time left: ${this.state.timeLeft} seconds`);
  //       this.state.timeLeft--;
  //     } else {
  //       console.log("Countdown finished!");
  //       this.clock.clear(); // Clear the interval
  //     }
  //   }, 1000); // Execute every second
  // }

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());
    console.log(client.sessionId, "joined!");
    this.broadcast("playerJoined", client.sessionId);
    if (this.clients.length === 2) {
      console.log("2 users in the room..");
      this.broadcast("startDate", this.state.timeLeft);
      this.broadcast("players", this.clients.length);
    }
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
    console.log(client.sessionId, "left!");
    this.broadcast("playerLeft", client.sessionId);

    try {
      if (consented) {
        console.log("consented exit..");
      }
      // await this.allowReconnection(client, 10);
      // console.log("Reconnected!");
      // client.send("status", "Welcome back!");
    } catch (error) {
      console.error(error);
    }

    //  this.clock.stop();
    // console.log("Player left, clock stopped..");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    // clearInterval(this.count);
    this.broadcast("disposed");
  }
}
