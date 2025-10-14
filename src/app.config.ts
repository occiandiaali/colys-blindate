import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { GreenRoom } from "./rooms/GreenRoom";
import { MazeRoom } from "./rooms/MazeRoom";
import { ForestRoom } from "./rooms/ForestRoom";
import { HoodMapRoom } from "./rooms/HoodMapRoom";
import { PlayParkRoom } from "./rooms/PlayParkRoom";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("forest", ForestRoom);
    gameServer.define("hood_map", HoodMapRoom);
    gameServer.define("play_park", PlayParkRoom);
    gameServer.define("my_room", MyRoom);
    gameServer.define("green_room", GreenRoom);
    gameServer.define("maze_room", MazeRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("Let's get ready to rumblllllllle!");
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
