import { Room, Client } from "@colyseus/core";
import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0.5; //-0.2;
  @type("number") z = 0;
}

class HauntedHouseState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") timeLimit: number; // In seconds?
  @type("boolean") gameStarted: boolean = false;
  @type("boolean") gameOver: boolean = false;
}

export class HauntedHouse extends Room<HauntedHouseState> {
  onCreate(options: any) {
    this.maxClients = 2;
    this.state = new HauntedHouseState();

    console.log("HauntedHouse Room created with options:", options);

    // const timer = options.timer || 60;
    this.state.timeLimit = options.timer * 60 || 300; // Default 300 seconds (5mins)

    // Setup schema with players map...
    this.onMessage("updatePosition", (client, data) => {
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

    this.onMessage("peer-id", (client, message) => {
      // Broadcast PeerJS ID to other client
      this.clients.forEach((c) => {
        if (c.sessionId !== client.sessionId) {
          c.send("peer-id", message);
        }
      });
    });
  } // onCreate

  onJoin(client: Client, options: any) {
    console.log(client.sessionId + " just joined!");
    // Add player to state...
    const player = new Player();
    this.state.players.set(client.sessionId, player);
    console.log("In players obj: ", JSON.stringify(this.state.players));

    if (this.clients.length === 2) {
      this.state.gameStarted = true;
    }
    if (this.state.gameStarted) {
      this.broadcast("gameStarted", this.state.gameStarted);

      // Countdown loop
      const interval = setInterval(() => {
        this.state.timeLimit--;

        this.broadcast("remainingTime", this.state.timeLimit);

        if (this.state.timeLimit <= 0) {
          this.state.gameOver = true;
          clearInterval(interval);
          this.disconnect();
          this.broadcast("gameOver", this.state.gameOver);
        }
      }, 1000);
    }
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "left!");
    // Remove player from state...
    this.state.players.delete(client.sessionId);
    this.broadcast("playerLeft", client.sessionId);
  }

  onDispose(): void | Promise<any> {
    console.log("Disposing empty room..");
  }
}
