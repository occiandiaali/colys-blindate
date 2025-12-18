import { Room, Client } from "@colyseus/core";
import { MapSchema, Schema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("string") sessionId: string;
  @type("string") username: string;
  @type("number") x = 0;
  @type("number") y = 0.5; //-0.2;
  @type("number") z = 0;
}

class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") timeLimit: number; // In seconds?
  @type("boolean") gameStarted: boolean = false;
  @type("boolean") gameOver: boolean = false;
}

export class GameRoom extends Room<GameRoomState> {
  countdownInterval: string | number | NodeJS.Timeout;

  onCreate(options: any): void | Promise<any> {
    this.maxClients = 2;
    this.state = new GameRoomState();
    this.state.timeLimit = options.limit * 60;

    this.broadcast("roomCreated", options.roomid);

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
  }
  onJoin(
    client: Client<any, any>,
    options?: any,
    auth?: any
  ): void | Promise<any> {
    const player = new Player();
    player.sessionId = client.sessionId;
    //player.username = options.currentUser;
    this.state.players.set(client.sessionId, player);
    // console.log(`Player joined: ${player.username}-${player.sessionId}..`);

    // if (this.clients.length === 2) {
    //   this.state.gameStarted = true;
    //   this.broadcast("gameStarted", this.state.gameStarted);
    //   this.setSimulationInterval(this.tick.bind(this), 1000);
    // }
    if (Object.keys(this.state.players).length === 2) {
      this.state.gameStarted = true;
      this.broadcast("gameStarted", this.state.gameStarted);
      this.setSimulationInterval(this.tick.bind(this), 1000);
    }
  }
  onLeave(client: Client<any, any>, consented?: boolean): void | Promise<any> {
    console.log("Client left:", client.sessionId);
    this.state.players.delete(client.sessionId);
    this.broadcast("playerLeft", client.sessionId);
  }
  onDispose(): void | Promise<any> {
    clearInterval(this.countdownInterval);
    this.broadcast("disposed", "Disposing empty room..");
  }

  tick() {
    if (this.state.timeLimit > 0) {
      this.state.timeLimit--;
      this.broadcast("countdownUpdate", this.state.timeLimit);
    } else {
      this.endCountdown();
    }
  }

  endCountdown() {
    this.broadcast("countdownEnded");
    clearInterval(this.countdownInterval);
  }
}
