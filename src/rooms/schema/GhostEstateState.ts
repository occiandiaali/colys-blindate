import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") username: string;
  @type("number") x: number = 0;
  @type("number") y: number = 0.5;
  @type("number") z: number = 0;
}

export class GhostEstateState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") timeLeft: number;
  @type("string") timerString: string;

  @type("number") duration: number;
}
