import { Room, Client } from "@colyseus/core";

export class DuplexRoom extends Room {
  onCreate(options: any) {
    this.maxClients = 2;
    this.setState({ players: {} });
    this.setMetadata({
      allowedUsers: options.allowedUsers,
      timer: options.timer,
      thisRoom: options.roomId,
    });

    console.log("Duplexe Room created with ID:", this.metadata.thisRoom);
    console.log("Duration: ", this.metadata.timer);
    console.log("Members: ", this.metadata.allowedUsers);

    this.onMessage(
      "move",
      (
        client: { sessionId: string | number },
        data: { x: any; y: any; z: any; yaw: any }
      ) => {
        const player = this.state.players[client.sessionId];
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.z = data.z;
          player.yaw = data.yaw;
        }
      }
    );
  }

  onJoin(
    client: {
      sessionId: string | number;
      send: (arg0: string, arg1: { index: number }) => void;
    },
    options: any
  ) {
    // assign index based on join order
    const index = Object.keys(this.state.players).length;
    this.state.players[client.sessionId] = { x: 0, y: 0, z: 0, yaw: 0, index };

    // tell the client which capsule index to use
    client.send("assignIndex", { index });
    console.log(client.sessionId, "joined with index", index);
  }

  onLeave(client: { sessionId: string | number }) {
    delete this.state.players[client.sessionId];
    console.log(client.sessionId, "left");
  }
}

//module.exports = { DuplexRoom };
