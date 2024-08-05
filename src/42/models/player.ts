import { Domino } from "./domino";

export class Player {
  index: number;
  number: number;
  name: string;
  score: number;
  hand: Array<Domino>;
  selected: Array<Domino>;
  isDeliberating: boolean;

  constructor(index: number, playerNumber: number, name: string) {
    this.index = index;
    this.number = playerNumber;
    this.name = name;
    this.score = 0;
    this.hand = [];
    this.selected = [];
    this.isDeliberating = false;
  }

  addDominoToHand(domino: Domino) {
    this.hand.push(domino);
  }

  // this function is working fine - an error further on in AI will stop dominoes being removed from hands
  removeDominoFromHand(domino: Domino): void {
    const index = this.hand.indexOf(domino);
    const selectedIndex = this.selected.indexOf(domino);
    this.hand.splice(index, 1);
    if (selectedIndex !== -1 ) {
      this.selected = [];
    }
  }

  selectDomino(domino: Domino): void {
    this.selected = [];
    this.selected.push(domino);
  }

  clearHand(): void {
    this.hand = [];
  }
}
