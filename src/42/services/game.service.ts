import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domino } from '../models/domino';
import { DominoDTO } from '../models/dominioDTO';
import { Player } from '../models/player';
import { Bid } from '../models/bid';
import { Trick } from '../models/trick';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // TODO: create state object
  originalSet: Array<DominoDTO> = [];
  set: Array<Domino> = [];
  board!: Trick;
  grave: Array<Trick> = [];
  players: Array<Player> = [];
  activePlayer!: Player;
  hasDeclaredBid = false;
  // leadDomino, winningDomino, and leadValue may all be a part of Trick class (Board)
  leadDomino!: Domino;  // TODO: needed? or only on trick
  winningDomino!: Domino;  // TOOD: needed? or only on trick
  leadValue!: number;
  turn = 0;
  trick = 0;
  bid!: Bid;
  log: Array<string> = [];

  constructor(private httpClient: HttpClient) { }

  init() {
    this.loadDominoes().subscribe(response => {
      this.originalSet = response.set;
    });
  }

  loadDominoes(): Observable<any> {
    const url = '/assets/dominoes.json';
    return this.httpClient.get(url);
  }

  createPlayer(playerNumber: number, name: string): void {
    const index = this.players.length ? this.players.length : 0;
    const player: Player = new Player(index, playerNumber, name);
    this.players.push(player);
  }

  createDominoes(): Array<Domino> {
    const dominoes: Array<Domino> = [];
    for(let i = 0; i < this.originalSet.length; i++) {
      const domino: Domino = new Domino(this.originalSet[i]);
      dominoes.push(domino);
    }
    return dominoes;
  }

  dealNewHand(): void {
    this.clearAllHands();
    this.set = this.createDominoes();
    const that = this;
    for (let i = 27, currentPlayer = 0; i >= 0; i--) {
      const randomNumber = Math.floor(Math.random() * (i + 1));
      const domino: Domino = that.set[randomNumber];
      that.players[currentPlayer].addDominoToHand(domino);
      that.set.splice(randomNumber, 1);
      currentPlayer = currentPlayer === 3 ? 0 : currentPlayer + 1;
    }
    this.activePlayer = this.players[0];
    this.turn = 1;
    this.trick = 1;
    this.board = new Trick(this.trick);
  }

  // Player 1 leads the trick by selecting a domino - remove domino from hand, place on board, set as winning domino, and switch to AI
  leadWithDomino(domino: Domino): void {
    this.players[0].removeDominoFromHand(domino);
    this.board.set.push(domino);
    this.log.push(this.players[0].name + ' played a ' + domino.getValue(this.bid.trump));
    this.leadDomino = domino;
    this.winningDomino = domino;
    this.leadValue = this.bid.trump === this.leadDomino.secondary ? this.leadDomino.secondary : this.leadDomino.primary;
    this.board.leadDomino = domino;
    this.board.winningDomino = domino;
    this.board.winningPlayer = this.players[0];
    this.activePlayer = this.players[1];
    this.turn++;
    this.followAI();
  }

  followAI(): void {
    console.log(this.activePlayer.name + ' is deliberating...');
    this.activePlayer.isDeliberating = true;
    setTimeout(() => {
      // Condition #1: Last domino
      if (this.activePlayer.hand.length === 1) {
        console.log(this.activePlayer.name + ' has only 1 domino remaining, playing...');
        this.followWithDomino(this.activePlayer.hand[0]);
      }
      // Condition #2: Follow lead domino
      const matches: Array<Domino> = [];
      for(let i = 0; i < this.activePlayer.hand.length; i++) {
        const domino: Domino  = this.activePlayer.hand[i];
        if (domino.primary === this.leadValue || domino.secondary === this.leadValue) {
          matches.push(domino);
        }
      }
      if (matches.length) {
        // Conditon #2a: Follow with lowest match 
        console.log(matches.length + ' matches found to follow lead value of: ' + this.leadValue);
        const lowDomino: Domino = this.findLowDomino(matches);
        console.log('Following with lowest match to lead: ' + lowDomino.getValue(this.bid.trump));
        this.followWithDomino(lowDomino);
      } else {
        // Condition #2b: Follow with lowest domino
        console.log('0 matches found to follow lead value of: ' + this.leadValue);
        const lowDomino: Domino = this.findLowDomino(this.activePlayer.hand);
        console.log('Following with lowest domino in hand: ' + lowDomino.getValue(this.bid.trump));
        this.followWithDomino(lowDomino);
      }
    }, 4000);
  }

  followWithDomino(domino: Domino): void {
    this.activePlayer.removeDominoFromHand(domino);
    this.board.set.push(domino);
    this.log.push(this.activePlayer.name + ' played a ' + domino.getValue(this.bid.trump));
    if (!this.board.hasLeadDouble(this.leadValue)) {
      if (domino.isDouble || domino.total > this.leadDomino.total) {
        this.winningDomino = domino;
        this.board.winningDomino = domino;
        this.board.winningPlayer = this.activePlayer;
      }
    }
    this.activePlayer.isDeliberating = false;
    if (this.activePlayer.index === 3) {
      // End of trick
      this.endTrick();
    }
    this.activePlayer = this.activePlayer.index === 3 ? this.players[0] : this.players[this.activePlayer.index + 1];
    this.turn++;
    if (this.activePlayer.index !== 0) {
      this.followAI();
    }
  }

  endTrick(): void {
    let score = 0;
    // TODO: toast or confirmation popup with results of this trick
    for(let i = 0; i < 4; i++) {
      const domino = this.board.set[i];
      if (domino.isCount) {
        score += domino.total;
      }
    }
    if (score > 0) {
      this.board.count += score;
      this.board.winningPlayer.score += score + 1;
    }
    this.grave.push(this.board);
    this.log.push(this.board.winningPlayer.name + ' won trick #' + this.board.number + ', count: ' + score);
    // TODO: control of game may change depending on who won Trick
    this.activePlayer = this.board.winningPlayer;
    // TODO: start new Trick
    this.trick++;
    this.board = new Trick(this.trick);
  }

  findHighDomino(dominoes: Array<Domino>): Domino {
    let high: Domino = dominoes[0];
    for(let i = 1; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        high = domino;
        return high;
      }
      if (domino.total > high.total) {
        high = domino;
      }
    }
    return high;
  }

  findLowDomino(dominoes: Array<Domino>): Domino {
    let low: Domino = dominoes[0];
    for(let i = 1; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.total < low.total && !domino.isDouble) {
        low = domino;
      }
    }
    return low;
  }  

  clearAllHands(): void {
    this.players[0].clearHand();
    this.players[1].clearHand();
    this.players[2].clearHand();
    this.players[3].clearHand();
  }

  debug(object: any): void {
    console.log(object);
  }
}
