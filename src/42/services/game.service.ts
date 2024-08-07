import { Injectable } from '@angular/core';
import { Domino } from '../models/domino';
import { Trick } from '../models/trick';
import { DominoService } from './domino.service';
import { PlayerService } from './player.service';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private dominoService: DominoService,
    private playerService: PlayerService,
    private state: StateService
  ) {}

  dealNewHand(): void {
    this.state.isTestMode = false;
    this.playerService.clearAllHands();
    this.dominoService.createDominoes();
    this.state.grave = [];
    this.state.log = [];
    const that = this;
    for (let i = 27, currentPlayer = 0; i >= 0; i--) {
      const randomNumber = Math.floor(Math.random() * (i + 1));
      const domino: Domino = this.state.set[randomNumber];
      that.state.players[currentPlayer].addDominoToHand(domino);
      that.state.set.splice(randomNumber, 1);
      currentPlayer = currentPlayer === 3 ? 0 : currentPlayer + 1;
    }
    this.state.activePlayer = this.state.players[0];
    this.state.turn = 1;
    this.state.trick = 1;
    this.state.board = new Trick(this.state.trick);
  }

  dealTestHand(): void {
    this.state.isTestMode = true;
    this.playerService.clearAllHands();
    this.dominoService.createDominoes();
    this.state.grave = [];
    this.state.log = [];    
    const testTrick = new Trick(1);
    testTrick.set = this.state.set;
    this.state.grave.push(testTrick);
    this.state.activePlayer = this.state.players[0];
  }

  dealTestDomino(domino: Domino): void {
    if (this.state.isTestMode) {
      this.state.activePlayer.addDominoToHand(domino);
      this.state.grave[0].set.splice(this.state.grave[0].set.indexOf(domino), 1);
      this.state.activePlayer = this.state.activePlayer.index === 3 ? this.state.players[0] : this.state.players[this.state.activePlayer.index + 1];
      if (this.state.grave[0].set.length === 0) {
        this.state.isTestMode = false;
        this.state.grave = [];
        this.state.activePlayer = this.state.players[0];
        this.state.turn = 1;
        this.state.trick = 1;
        this.state.board = new Trick(this.state.trick);        
      }
    }
  }

  debug(object: any): void {
    console.log(object);
  }
}
