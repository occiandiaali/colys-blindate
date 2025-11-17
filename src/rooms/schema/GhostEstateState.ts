import { MapSchema, Schema, type } from "@colyseus/schema";

export class Member extends Schema {
  @type("string") username: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") z: number;
}

export class GhostEstateState extends Schema {
  @type({ map: Member }) members = new MapSchema<Member>();
  @type("number") timeLeft: number;
  @type("string") timerString: string;

  @type("number") duration: number;
}
