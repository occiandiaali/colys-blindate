import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import cors from "cors";

/**
 * Import your Room files
 */
import { GhostEstate } from "./rooms/GhostEstate";
import { MyRoom } from "./rooms/MyRoom";
import { GreenRoom } from "./rooms/GreenRoom";
import { MazeRoom } from "./rooms/MazeRoom";
import { ForestRoom } from "./rooms/ForestRoom";
import { HoodMapRoom } from "./rooms/HoodMapRoom";
import { PlayParkRoom } from "./rooms/PlayParkRoom";
import { CordeliaCourt } from "./rooms/CordeliaCourt";
import { matchMaker } from "colyseus";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */

    gameServer.define("ghost_estate", GhostEstate);
    gameServer.define("cordelia_court", CordeliaCourt);
    gameServer.define("forest", ForestRoom);
    gameServer.define("hood_map", HoodMapRoom);
    gameServer.define("play_park", PlayParkRoom);
    gameServer.define("my_room", MyRoom);
    gameServer.define("green_room", GreenRoom);
    gameServer.define("maze_room", MazeRoom);
  },

  initializeExpress: (app) => {
    // Enable CORS for dev + prod
    app.use(
      cors({
        origin: [
          "http://localhost:5173", // SvelteKit dev
          "https://playcanv.as", // Game scene hosting
          // "*", // TODO remove
          //  "https://your-frontend.onrender.com"  // Production frontend
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
      })
    );
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("Let's get ready to rumblllllllle!");
    });

    // Example metadata endpoint
    app.get("/room/:id", async (req, res) => {
      const roomId = req.params.id;
      const room = await matchMaker.getRoomById(roomId); //server.matchMaker.getRoomById(roomId);

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json({
        roomId: room.roomId,
        clients: room.clients,
        maxClients: room.maxClients,
        metadata: room.metadata, // you can set this in your room
      });
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
