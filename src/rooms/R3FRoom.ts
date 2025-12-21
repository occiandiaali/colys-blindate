import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
}

class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") countdown: number;
  @type("string") ID: string;
}

export class R3FRoom extends Room<State> {
  maxClients = 2;

  onCreate(options: any) {
    // this.setState(new State());
    this.state = new State();
    const limit = options.timer; //options.countdownDuration;
    const id = options.room;
    console.log("onCreate timer: ", limit);
    console.log("Room ID: ", id);
    //this.state.countdown = options.countdownDuration * 60 || 300; // Default 300 seconds (5mins)
    this.state.countdown = +limit * 60 || 300; // Default 300 seconds (5mins)
    this.state.ID = id;

    // this.onMessage("input", (client, data) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;

    //   const speed = 0.1; // 1 is too fast for real-time movement
    //   if (typeof data.dx === "number" && typeof data.dz === "number") {
    //     player.x += data.dx * speed;
    //     player.z += data.dz * speed;
    //   }
    // });
    this.onMessage("input", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const speed = 0.1;
      const nextX = player.x + data.dx * speed;
      const nextZ = player.z + data.dz * speed;

      const half = 0.3; // half cube size
      let blocked = false;

      // Check collision with other players
      this.state.players.forEach((other, id) => {
        if (id === client.sessionId) return;

        const overlapX = Math.abs(nextX - other.x) < half * 2;
        const overlapZ = Math.abs(nextZ - other.z) < half * 2;

        if (overlapX && overlapZ) {
          blocked = true;
        }
      });

      if (!blocked) {
        player.x = nextX;
        player.z = nextZ;
      }
    });
  }

  onJoin(client: Client) {
    const p = new Player();
    p.x = Math.random() * 4 - 2;
    p.z = Math.random() * 4 - 2;
    // this.state.players[client.sessionId] = p;
    this.state.players.set(client.sessionId, p);
    console.log(`Player joined: ${client.sessionId}..`);

    if (this.clients.length === 2) {
      this.broadcast("gameStarted", "Starting your timer..");
      console.log(`Starting date..Duration: ${this.state.countdown}`);
      const timer = setInterval(() => {
        if (this.state.countdown > 0) {
          this.state.countdown--;
          this.broadcast("timeLeft", this.state.countdown);
        } else {
          clearInterval(timer);
          this.disconnect();
        }
      }, 1000);
    }
  }

  onLeave(client: Client) {
    // delete this.state.players[client.sessionId];
    this.state.players.delete(client.sessionId);
    console.log(`Player left: ${client.sessionId}..`);
  }
}
