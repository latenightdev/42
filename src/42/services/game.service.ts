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

  originalSet: Array<DominoDTO> = [];
  set: Array<Domino> = [];
  board!: Trick;
  grave: Array<Trick> = [];
  players: Array<Player> = [];
  activePlayer!: Player;
  hasDeclaredBid = false;
  // leadDomino, winningDomino, and leadValue may all be a part of Trick class (Board)
  leadDomino!: Domino;
  winningDomino!: Domino;
  leadValue!: number;
  turn = 0;
  trick = 0;
  bid!: Bid;

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
    console.log('Deliberating...');
    this.activePlayer.isDeliberating = true;
    setTimeout(() => {
      const matches: Array<Domino> = [];
      for(let i = 0; i < this.activePlayer.hand.length; i++) {
        const domino: Domino  = this.activePlayer.hand[i];
        if (domino.primary === this.leadValue || domino.secondary === this.leadValue) {
          matches.push(domino);
        }
      }
      if (matches.length) {
        console.log(matches.length + ' matches found to follow lead value of: ' + this.leadValue);
        const highestDomino: Domino = this.findHighestDomino(matches);
        console.log('Following with highest match to lead: ' + highestDomino.getValue());
        this.followWithDomino(highestDomino);
      }
    }, 4000);
  }

  followWithDomino(domino: Domino): void {
    this.activePlayer.removeDominoFromHand(domino);
    this.board.set.push(domino);
    if (domino.isDouble || domino.total > this.leadDomino.total) {
      this.winningDomino = domino;
      this.board.winningDomino = domino;
      this.board.winningPlayer = this.activePlayer;
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
    console.log(this.grave);
    // TODO: start new Trick
    // TODO: control of game may change depending on who won Trick
  }

  findHighestDomino(dominoes: Array<Domino>): Domino {
    let highest: Domino = dominoes[0];
    for(let i = 1; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        highest = domino;
        return highest;
      }
      if (domino.total > highest.total) {
        highest = domino;
      }
    }
    return highest;
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
