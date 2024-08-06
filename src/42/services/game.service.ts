import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Domino } from '../models/domino';
import { DominoDTO } from '../models/dominioDTO';
import { Player } from '../models/player';
import { Bid } from '../models/bid';
import { Trick } from '../models/trick';
import { Modal } from 'bootstrap';

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
  leadValue!: number;
  turn = 0;
  trick = 0;
  bid!: Bid;
  log: Array<string> = [];
  isTestMode = false;
  deliberationTimeout = 1000;

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
    this.isTestMode = false;
    this.clearAllHands();
    this.set = this.createDominoes();
    this.grave = [];
    this.log = [];
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

  dealTestHand(): void {
    this.isTestMode = true;
    this.clearAllHands();
    this.set = this.createDominoes();
    this.grave = [];
    this.log = [];    
    const testTrick = new Trick(1);
    testTrick.set = this.set;
    this.grave.push(testTrick);
    this.activePlayer = this.players[0];
  }

  dealTestDomino(domino: Domino): void {
    if (this.isTestMode) {
      this.activePlayer.addDominoToHand(domino);
      this.grave[0].set.splice(this.grave[0].set.indexOf(domino), 1);
      this.activePlayer = this.activePlayer.index === 3 ? this.players[0] : this.players[this.activePlayer.index + 1];
      if (this.grave[0].set.length === 0) {
        this.isTestMode = false;
        this.grave = [];
        this.activePlayer = this.players[0];
        this.turn = 1;
        this.trick = 1;
        this.board = new Trick(this.trick);        
      }
    }
  }

  // Player 1 leads the trick by selecting a domino - remove domino from hand, place on board, set as winning domino, and switch to AI
  leadWithDomino(domino: Domino): void {
    this.players[0].removeDominoFromHand(domino);
    this.board.set.push(domino);
    this.log.push(this.players[0].name + ' played a ' + domino.getValue(this.bid.trump));
    this.leadValue = this.bid.trump === domino.secondary ? domino.secondary : domino.primary;
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
      } else {
        // Condition #2: Follow lead domino
        const matches: Array<Domino> = [];
        for(let i = 0; i < this.activePlayer.hand.length; i++) {
          const domino: Domino  = this.activePlayer.hand[i];
          if (domino.primary === this.leadValue || domino.secondary === this.leadValue) {
            matches.push(domino);
          }
        }
        if (matches.length) {
          console.log(matches.length + ' matches found to follow lead value of: ' + this.leadValue);
          // if only 1 match
          if (matches.length === 1) {
            console.log('Following with only match to lead: ' + matches[0].getValue(this.bid.trump));  
            this.followWithDomino(matches[0]);
          } else {
            // does highest match beat current winningDomino??
            const highDomino: Domino = this.findHighDomino(matches);
            const winningDomino: Domino = this.board.winningDomino;
            if (!winningDomino.isDouble && (highDomino.isDouble || (highDomino.total > winningDomino.total))) {
              // Condition #2a: Follow with highest match 
              console.log('Following with highest match to lead: ' + highDomino.getValue(this.bid.trump));  
              this.followWithDomino(highDomino);
            } else {
              // Condition #2b: Follow with lowest match 
              const lowDomino: Domino = this.findLowDomino(matches);
              console.log('Following with lowest match to lead: ' + lowDomino.getValue(this.bid.trump));
              this.followWithDomino(lowDomino);
            }            
          }
        } else {
          // Condition #2c: Follow with lowest domino
          console.log('0 matches found to follow lead value of: ' + this.leadValue);
          const lowDomino: Domino = this.findLowDomino(this.activePlayer.hand);
          console.log('Following with lowest domino in hand: ' + lowDomino.getValue(this.bid.trump));
          this.followWithDomino(lowDomino);
        }
      }
    }, this.deliberationTimeout);
  }

  leadAI(): void {
    console.log(this.activePlayer.name + ' is deliberating...');
    this.activePlayer.isDeliberating = true;
    setTimeout(() => {
      // Condition #1: Last domino
      if (this.activePlayer.hand.length === 1) {
        console.log(this.activePlayer.name + ' has only 1 domino remaining, playing...');
        this.leadWithDominoAI(this.activePlayer.hand[0]);
      } else {
        // Condition #3?: AI would play highest trump or highest double or highest domino
        const trumps: Domino[] = this.findTrumps(this.activePlayer.hand);
        if (trumps.length) {
          // play highest trump
          if (trumps.length > 1) {
            const highTrump: Domino = this.findHighDomino(trumps);
            console.log('Leading with highest trump in hand: ' + highTrump.getValue(this.bid.trump));
            this.leadWithDominoAI(highTrump);
          } else {
            console.log('Leading with only trump in hand: ' + trumps[0].getValue(this.bid.trump));
            this.leadWithDominoAI(trumps[0]);
          }
        } else {
          const doubles: Domino[] = this.findDoubles(this.activePlayer.hand);
          if (doubles.length) {
            // play highest double
            if (doubles.length > 1) {
              const highDouble: Domino = this.findHighDomino(doubles);
              console.log('Leading with highest double in hand: ' + highDouble.getValue(this.bid.trump));
              this.leadWithDominoAI(highDouble);
            } else {
              console.log('Leading with only double in hand: ' + doubles[0].getValue(this.bid.trump));
              this.leadWithDominoAI(doubles[0]);
            }
          } else {
            // play highest domino
            const highDomino: Domino = this.findHighDomino(this.activePlayer.hand);
            console.log('Leading with highest domino in hand: ' + highDomino.getValue(this.bid.trump));
            this.leadWithDominoAI(highDomino);
          }   
        }
      }
    }, this.deliberationTimeout);
  }

  leadWithDominoAI(domino: Domino): void {
    this.activePlayer.removeDominoFromHand(domino);
    this.board.set.push(domino);
    this.log.push(this.activePlayer.name + ' played a ' + domino.getValue(this.bid.trump));
    this.activePlayer.isDeliberating = false;
    this.leadValue = this.bid.trump === domino.secondary ? domino.secondary : domino.primary;
    this.board.leadDomino = domino;
    this.board.winningDomino = domino;
    this.board.winningPlayer = this.activePlayer;    
    this.activePlayer = this.activePlayer.index === 3 ? this.players[0] : this.players[this.activePlayer.index + 1];
    this.turn++;
    if (this.activePlayer.index !== 0) {
      this.followAI();
    }
  }  

  followWithDomino(domino: Domino): void {
    this.activePlayer.removeDominoFromHand(domino);
    const winningDomino: Domino = this.board.winningDomino;
    if (!winningDomino.isDouble) {
      if (domino.isLead(this.leadValue) && (domino.isDouble || (domino.total > winningDomino.total))) {
        this.board.winningDomino = domino;
        this.board.winningPlayer = this.activePlayer;
      }
    }    
    this.board.set.push(domino);
    this.log.push(this.activePlayer.name + ' played a ' + domino.getValue(this.bid.trump));
    this.activePlayer.isDeliberating = false;
    // end of trick
    if (this.board.set.length === 4) {
      // set score on trick and player, then show trick results modal
      let score = 0;
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
      this.log.push(this.board.winningPlayer.name + ' won trick #' + this.board.number + ', count: ' + score);
      const trickElement = document.getElementById('trick') as HTMLElement;
      const trickModal = new Modal(trickElement);
      trickModal.show();
    } else {
      this.activePlayer = this.activePlayer.index === 3 ? this.players[0] : this.players[this.activePlayer.index + 1];
      this.turn++;
      if (this.activePlayer.index !== 0) {
        this.followAI();
      }
    }
  }

  endTrick(): void {
    this.activePlayer = this.board.winningPlayer;
    this.grave.push(this.board);
    this.trick++;
    this.board = new Trick(this.trick);
    if (this.activePlayer.index !== 0) {
      this.leadAI();
    }
  }

  findHighDomino(dominoes: Array<Domino>): Domino {
    let high: Domino = dominoes[0];
    for(let i = 0; i < dominoes.length; i++) {
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

  findTrumps(dominoes: Array<Domino>): Array<Domino> {
    let trumps = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.primary === this.bid.trump || domino.secondary === this.bid.trump) {
        trumps.push(domino);
      }
    }
    return trumps;
  }

  findDoubles(dominoes: Array<Domino>): Array<Domino> {
    let doubles = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        doubles.push(domino);
      }
    }
    return doubles;
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
