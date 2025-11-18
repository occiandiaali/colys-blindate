import { Client, Room } from "colyseus";
import { GhostEstateState, Player } from "./schema/GhostEstateState";

export class GhostEstate extends Room<GhostEstateState> {
  onCreate(options: any): void | Promise<any> {
    this.setState(new GhostEstateState());
    this.maxClients = 2;
    console.log("Initial state:", this.state.toJSON());

    this.setMetadata({
      allowedUsers: options.allowedUsers,
      timer: options.timer,
      thisRoom: options.roomId,
      memberName: options.username,
    });

    this.onMessage("positionUpdate", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
    });
  }

  onJoin(
    client: Client<any, any>,
    options?: any,
    auth?: any
  ): void | Promise<any> {
    console.log(client.sessionId, " joined..");
    //const FLOOR_SIZE = 4;
    const player = new Player();
    player.username = `${this.metadata.memberName}_${client.sessionId}`;
    // member.x = Math.floor(Math.random() * 2); //-(FLOOR_SIZE / 2) + Math.random() * FLOOR_SIZE;
    // member.y = 0.5;
    // member.z = Math.floor(Math.random() * 3); //-(FLOOR_SIZE / 2) + Math.random() * FLOOR_SIZE;
    console.log("newMember: ", JSON.stringify(player));
    console.log("newMember options: ", options);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client<any, any>, consented?: boolean): void | Promise<any> {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose(): void | Promise<any> {
    console.log("Disposing this empty Room...");
  }
}
