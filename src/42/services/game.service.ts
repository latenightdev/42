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

  followWithDomino(domino: Domino): void {
    this.state.activePlayer.removeDominoFromHand(domino);
    const winningDomino: Domino = this.state.board.winningDomino;
    if (!winningDomino.isDouble) {
      if (domino.isLead(this.state.leadValue) && (domino.isDouble || (domino.total > winningDomino.total))) {
        this.state.board.winningDomino = domino;
        this.state.board.winningPlayer = this.state.activePlayer;
      }
    }    
    this.state.board.set.push(domino);
    this.state.log.push(this.state.activePlayer.name + ' played a ' + domino.getValue(this.state.bid.trump));
    if (this.state.board.set.length !== 4) {
      this.state.activePlayer = this.state.activePlayer.index === 3 ? this.state.players[0] : this.state.players[this.state.activePlayer.index + 1];
      this.state.turn++;
      if (this.state.activePlayer.index !== 0) {
        this.playerService.selectDominoToFollow().then(domino => this.followWithDomino(domino));
      }
    } else {
      this.endTrick();
    }
  }

  leadWithDomino(domino: Domino): void {
    this.state.activePlayer.removeDominoFromHand(domino);
    this.state.board.set.push(domino);
    this.state.log.push(this.state.activePlayer.name + ' played a ' + domino.getValue(this.state.bid.trump));
    this.state.leadValue = this.state.bid.trump === domino.secondary ? domino.secondary : domino.primary;
    this.state.board.leadDomino = domino;
    this.state.board.winningDomino = domino;
    this.state.board.winningPlayer = this.state.activePlayer;
    this.state.activePlayer = this.state.activePlayer.index === 3 ? this.state.players[0] : this.state.players[this.state.activePlayer.index + 1];
    this.state.turn++;
    if (this.state.activePlayer.index !== 0) {
      this.playerService.selectDominoToFollow().then(domino => this.followWithDomino(domino));
    }
  }

  endTrick(): void {
    let score = 1;
    for(let i = 0; i < 4; i++) {
      const domino = this.state.board.set[i];
      if (domino.isCount) {
        score += domino.total;
      }
    }
    this.state.board.count += score;
    this.state.board.winningPlayer.score += score;
    this.state.log.push(this.state.board.winningPlayer.name + ' won trick #' + this.state.board.number + ', count: ' + score);
  }

  nextTrick(): void {
    this.state.activePlayer = this.state.board.winningPlayer;
    this.state.grave.push(this.state.board);
    this.state.trick++;
    this.state.board = new Trick(this.state.trick);
    if (this.state.activePlayer.index !== 0) {
      this.playerService.selectDominoToLead().then(domino => this.leadWithDomino(domino));
    }
  }

  dealNewHand(): void {
    this.state.isTestMode = false;
    this.beforeDeal();
    const that = this;
    for (let i = 27, currentPlayer = 0; i >= 0; i--) {
      const randomNumber = Math.floor(Math.random() * (i + 1));
      const domino: Domino = this.state.set[randomNumber];
      that.state.players[currentPlayer].addDominoToHand(domino);
      that.state.set.splice(randomNumber, 1);
      currentPlayer = currentPlayer === 3 ? 0 : currentPlayer + 1;
    }
    this.afterDeal();
  }

  dealTestHand(): void {
    this.state.isTestMode = true;
    this.beforeDeal();
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
        this.afterDeal();
      }
    }
  }

  afterDeal(): void {
    this.state.activePlayer = this.state.players[0];
    this.state.turn = 1;
    this.state.trick = 1;
    this.state.board = new Trick(this.state.trick);
  }
  
  beforeDeal(): void {
    this.playerService.clearAllHands();
    this.dominoService.createDominoes();
    this.state.grave = [];
    this.state.leadValue = 0;
    this.state.log = [];
    this.state.hasDeclaredBid = false;
  }  

  debug(object: any): void {
    console.log(object);
  }
}
