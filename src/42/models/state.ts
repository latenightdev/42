import { Bid } from "./bid";
import { Trick } from "./trick";

export class State {
  board!: Trick;
  grave: Array<Trick> = [];
  leadValue!: number;
  turn = 0;
  trick = 0;
  bid!: Bid;
  log: Array<string> = [];
  isTestMode = false;
}
