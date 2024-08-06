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

  hasLeadDouble(lead: number): boolean {
    for (let i = 0; i < this.set.length; i++) {
      const domino = this.set[i];
      if (domino.isDouble && domino.isLead(lead)) {
        return true;
      }
    }
    return false;
  }  
}
