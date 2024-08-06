import { Domino } from "./domino";
import { Player } from "./player";

export class Trick {
  set: Array<Domino>;
  count = 0;
  leadDomino!: Domino;
  winningDomino!: Domino;
  winningPlayer!: Player;
  number = 0;

  constructor(trickNumber: number) {
    this.set = [];
    this.count = 0;
    this.number = trickNumber;
  }
}
