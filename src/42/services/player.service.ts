import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { Domino } from '../models/domino';
import { DominoService } from './domino.service';
import { Modal } from 'bootstrap';
import { Trick } from '../models/trick';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private dominoService: DominoService, private state: StateService) {}

  init(): void {
    this.createPlayers();
  }

  createPlayers(): void {
    this.createPlayer(1, 'Player 1');
    this.createPlayer(2, 'Player 2');
    this.createPlayer(3, 'Player 3');
    this.createPlayer(4, 'Player 4');
  }  

  createPlayer(playerNumber: number, name: string): void {
    const index = this.state.players.length ? this.state.players.length : 0;
    const player: Player = new Player(index, playerNumber, name);
    this.state.players.push(player);
  }

  // Player 1 leads the trick by selecting a domino - remove domino from hand, place on board, set as winning domino, and switch to AI
  leadWithDomino(domino: Domino): void {
    this.state.players[0].removeDominoFromHand(domino);
    this.state.board.set.push(domino);
    this.state.log.push(this.state.players[0].name + ' played a ' + domino.getValue(this.state.bid.trump));
    this.state.leadValue = this.state.bid.trump === domino.secondary ? domino.secondary : domino.primary;
    this.state.board.leadDomino = domino;
    this.state.board.winningDomino = domino;
    this.state.board.winningPlayer = this.state.players[0];
    this.state.activePlayer = this.state.players[1];
    this.state.turn++;
    this.followAI();
  }

  followAI(): void {
    console.log(this.state.activePlayer.name + ' is deliberating...');
    this.state.activePlayer.isDeliberating = true;
    setTimeout(() => {
      // Condition #1: Last domino
      if (this.state.activePlayer.hand.length === 1) {
        console.log(this.state.activePlayer.name + ' has only 1 domino remaining, playing...');
        this.followWithDomino(this.state.activePlayer.hand[0]);
      } else {
        // Condition #2: Follow lead domino
        const matches: Array<Domino> = [];
        for(let i = 0; i < this.state.activePlayer.hand.length; i++) {
          const domino: Domino  = this.state.activePlayer.hand[i];
          if (domino.primary === this.state.leadValue || domino.secondary === this.state.leadValue) {
            matches.push(domino);
          }
        }
        if (matches.length) {
          console.log(matches.length + ' matches found to follow lead value of: ' + this.state.leadValue);
          // if only 1 match
          if (matches.length === 1) {
            console.log('Following with only match to lead: ' + matches[0].getValue(this.state.bid.trump));  
            this.followWithDomino(matches[0]);
          } else {
            // does highest match beat current winningDomino??
            const highDomino: Domino = this.dominoService.findHighDomino(matches);
            const winningDomino: Domino = this.state.board.winningDomino;
            if (!winningDomino.isDouble && (highDomino.isDouble || (highDomino.total > winningDomino.total))) {
              // Condition #2a: Follow with highest match 
              console.log('Following with highest match to lead: ' + highDomino.getValue(this.state.bid.trump));  
              this.followWithDomino(highDomino);
            } else {
              // Condition #2b: Follow with lowest match 
              const lowDomino: Domino = this.dominoService.findLowDomino(matches);
              console.log('Following with lowest match to lead: ' + lowDomino.getValue(this.state.bid.trump));
              this.followWithDomino(lowDomino);
            }            
          }
        } else {
          // Condition #2c: Follow with lowest domino
          console.log('0 matches found to follow lead value of: ' + this.state.leadValue);
          const lowDomino: Domino = this.dominoService.findLowDomino(this.state.activePlayer.hand);
          console.log('Following with lowest domino in hand: ' + lowDomino.getValue(this.state.bid.trump));
          this.followWithDomino(lowDomino);
        }
      }
    }, this.state.deliberationTimeout);
  }

  leadAI(): void {
    console.log(this.state.activePlayer.name + ' is deliberating...');
    this.state.activePlayer.isDeliberating = true;
    setTimeout(() => {
      // Condition #1: Last domino
      if (this.state.activePlayer.hand.length === 1) {
        console.log(this.state.activePlayer.name + ' has only 1 domino remaining, playing...');
        this.leadWithDominoAI(this.state.activePlayer.hand[0]);
      } else {
        // Condition #3?: AI would play highest trump or highest double or highest domino
        const trumps: Domino[] = this.dominoService.findTrumps(this.state.activePlayer.hand, this.state.bid.trump);
        if (trumps.length) {
          // play highest trump
          if (trumps.length > 1) {
            const highTrump: Domino = this.dominoService.findHighDomino(trumps);
            console.log('Leading with highest trump in hand: ' + highTrump.getValue(this.state.bid.trump));
            this.leadWithDominoAI(highTrump);
          } else {
            console.log('Leading with only trump in hand: ' + trumps[0].getValue(this.state.bid.trump));
            this.leadWithDominoAI(trumps[0]);
          }
        } else {
          const doubles: Domino[] = this.dominoService.findDoubles(this.state.activePlayer.hand);
          if (doubles.length) {
            // play highest double
            if (doubles.length > 1) {
              const highDouble: Domino = this.dominoService.findHighDomino(doubles);
              console.log('Leading with highest double in hand: ' + highDouble.getValue(this.state.bid.trump));
              this.leadWithDominoAI(highDouble);
            } else {
              console.log('Leading with only double in hand: ' + doubles[0].getValue(this.state.bid.trump));
              this.leadWithDominoAI(doubles[0]);
            }
          } else {
            // play highest domino
            const highDomino: Domino = this.dominoService.findHighDomino(this.state.activePlayer.hand);
            console.log('Leading with highest domino in hand: ' + highDomino.getValue(this.state.bid.trump));
            this.leadWithDominoAI(highDomino);
          }   
        }
      }
    }, this.state.deliberationTimeout);
  }

  leadWithDominoAI(domino: Domino): void {
    this.state.activePlayer.removeDominoFromHand(domino);
    this.state.board.set.push(domino);
    this.state.log.push(this.state.activePlayer.name + ' played a ' + domino.getValue(this.state.bid.trump));
    this.state.activePlayer.isDeliberating = false;
    this.state.leadValue = this.state.bid.trump === domino.secondary ? domino.secondary : domino.primary;
    this.state.board.leadDomino = domino;
    this.state.board.winningDomino = domino;
    this.state.board.winningPlayer = this.state.activePlayer;    
    this.state.activePlayer = this.state.activePlayer.index === 3 ? this.state.players[0] : this.state.players[this.state.activePlayer.index + 1];
    this.state.turn++;
    if (this.state.activePlayer.index !== 0) {
      this.followAI();
    }
  }  

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
    this.state.activePlayer.isDeliberating = false;
    // end of trick
    if (this.state.board.set.length === 4) {
      // set score on trick and player, then show trick results modal
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
      const trickElement = document.getElementById('trick') as HTMLElement;
      const trickModal = new Modal(trickElement);
      trickModal.show();
    } else {
      this.state.activePlayer = this.state.activePlayer.index === 3 ? this.state.players[0] : this.state.players[this.state.activePlayer.index + 1];
      this.state.turn++;
      if (this.state.activePlayer.index !== 0) {
        this.followAI();
      }
    }
  }

  endTrick(): void {
    this.state.activePlayer = this.state.board.winningPlayer;
    this.state.grave.push(this.state.board);
    this.state.trick++;
    this.state.board = new Trick(this.state.trick);
    if (this.state.activePlayer.index !== 0) {
      this.leadAI();
    }
  }  

  clearAllHands(): void {
    this.state.players[0].clearHand();
    this.state.players[1].clearHand();
    this.state.players[2].clearHand();
    this.state.players[3].clearHand();
  }  
}
