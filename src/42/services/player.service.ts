import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { Domino } from '../models/domino';
import { DominoService } from './domino.service';
import { StateService } from './state.service';
import { Bid } from '../models/bid';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private dominoService: DominoService, private state: StateService) {}

  init(): void {
    this.createPlayers();
  }

  selectDominoToFollow(): Promise<Domino> {
    console.log(this.state.activePlayer.name + ' is deliberating...');
    this.state.activePlayer.isDeliberating = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        // Condition #1: Last domino
        if (this.state.activePlayer.hand.length === 1) {
          console.log(this.state.activePlayer.name + ' has only 1 domino remaining, playing...');
          resolve(this.state.activePlayer.hand[0]);
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
            // found matches to lead
            console.log(matches.length + ' matches found to follow lead value of: ' + this.state.leadValue);
            // if only 1 match
            if (matches.length === 1) {
              console.log('Following with only match to lead: ' + matches[0].getValue(this.state.bid.trump));  
              resolve(matches[0]);
            } else {
              // does highest match beat current winningDomino??
              const highDomino: Domino = this.dominoService.findHighDomino(matches);
              const winningDomino: Domino = this.state.board.winningDomino;
              if (!winningDomino.isDouble && (highDomino.isDouble || (highDomino.total > winningDomino.total))) {
                // Condition #2a: Follow with highest match 
                console.log('Following with highest match to lead: ' + highDomino.getValue(this.state.bid.trump));  
                resolve(highDomino);
              } else {
                // Condition #2b: Follow with lowest match 
                const lowDomino: Domino = this.dominoService.findLowDomino(matches);
                console.log('Following with lowest match to lead: ' + lowDomino.getValue(this.state.bid.trump));
                resolve(lowDomino);
              }            
            }
          } else {
            // 0 matches to lead
            console.log('0 matches found to follow lead value of: ' + this.state.leadValue);
            const partnerPlayer: Player = this.findPartner(this.state.activePlayer);
            if (this.state.board.winningPlayer === partnerPlayer) {
              // Condition #2d: Follow with highest count to help partner
              const counts: Domino[] = this.dominoService.findCounts(this.state.activePlayer.hand);
              if (counts.length) {
                if (counts.length > 1) {
                  const highCount: Domino = this.dominoService.findHighDomino(counts);
                  console.log('Following with highest count in hand: ' + highCount.getValue(this.state.bid.trump));
                  resolve(highCount);
                } else {
                  console.log('Following with only count in hand: ' + counts[0].getValue(this.state.bid.trump));
                  resolve(counts[0]);
                }   
              } else {
                const lowDomino: Domino = this.dominoService.findLowDomino(this.state.activePlayer.hand);
                console.log('Following with lowest domino in hand: ' + lowDomino.getValue(this.state.bid.trump));
                resolve(lowDomino);              
              }
            } else {
              // Condition #2c: Follow with lowest domino
              const lowDomino: Domino = this.dominoService.findLowDomino(this.state.activePlayer.hand);
              console.log('Following with lowest domino in hand: ' + lowDomino.getValue(this.state.bid.trump));
              resolve(lowDomino);
            }
          }
        }
        this.state.activePlayer.isDeliberating = false;
      }, this.state.deliberationTimeout);
    });
  }

  selectDominoToLead(): Promise<Domino> {
    console.log(this.state.activePlayer.name + ' is deliberating...');
    this.state.activePlayer.isDeliberating = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        // Condition #1: Last domino
        if (this.state.activePlayer.hand.length === 1) {
          console.log(this.state.activePlayer.name + ' has only 1 domino remaining, playing...');
          resolve(this.state.activePlayer.hand[0]);
        } else {
          // Condition #3?: AI would play highest trump or highest double or highest domino
          const trumps: Domino[] = this.dominoService.findTrumps(this.state.activePlayer.hand, this.state.bid.trump);
          if (trumps.length) {
            // play highest trump
            if (trumps.length > 1) {
              const highTrump: Domino = this.dominoService.findHighDomino(trumps);
              console.log('Leading with highest trump in hand: ' + highTrump.getValue(this.state.bid.trump));
              resolve(highTrump);
            } else {
              console.log('Leading with only trump in hand: ' + trumps[0].getValue(this.state.bid.trump));
              resolve(trumps[0]);
            }
          } else {
            const doubles: Domino[] = this.dominoService.findDoubles(this.state.activePlayer.hand);
            if (doubles.length) {
              // play highest double
              if (doubles.length > 1) {
                const highDouble: Domino = this.dominoService.findHighDouble(doubles);
                console.log('Leading with highest double in hand: ' + highDouble.getValue(this.state.bid.trump));
                resolve(highDouble);
              } else {
                console.log('Leading with only double in hand: ' + doubles[0].getValue(this.state.bid.trump));
                resolve(doubles[0]);
              }
            } else {
              // play highest domino
              const highDomino: Domino = this.dominoService.findHighDomino(this.state.activePlayer.hand);
              console.log('Leading with highest domino in hand: ' + highDomino.getValue(this.state.bid.trump));
              resolve(highDomino);
            }   
          }
        }
        this.state.activePlayer.isDeliberating = false;
      }, this.state.deliberationTimeout);
    });
  }

  selectBidToFollow(): Promise<Bid> {
    console.log(this.state.activePlayer.name + ' is deliberating...');
    this.state.activePlayer.isDeliberating = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        const doubles: Domino[] = this.dominoService.findDoubles(this.state.activePlayer.hand);
        let bid: Bid = {bid: 0, trump: 0, player: this.state.activePlayer};
        if (doubles.length) {
          //let bid: Bid = {bid: 0, trump: doubles[0].primary};
          for(let i = 0; i < doubles.length; i++) {
            const double: Domino  = doubles[i];
            const numMatches = this.dominoService.findMatches(this.state.activePlayer.hand, double.primary).length;
            if (numMatches > bid.bid) {
              bid.bid = numMatches;
              bid.trump = double.primary;
            }
          }
          console.log(bid);
          // TODO: simplified bidding for now
          if (bid.bid === 4) {
            bid.bid = 30;
            resolve(bid);
          } else if (bid.bid === 5) {
            bid.bid = 31;
            resolve(bid);
          } else if (bid.bid === 6) {
            bid.bid = 32;
            resolve(bid);
          } else if (bid.bid === 7) {
            bid.bid = 42;
            resolve(bid);
          } else {
            bid.bid = 0;
            resolve(bid);  
          }
        } else {
          resolve(bid);
        }
        this.state.activePlayer.isDeliberating = false;
      }, this.state.deliberationTimeout);
    });    
  }

  findPartner(activePlayer: Player): Player {
    if (activePlayer.index === 1) {
      return this.state.players[3];
    } else if (activePlayer.index === 2) {
      return this.state.players[0];
    } else {
      return this.state.players[1];
    }
  }  

  clearAllHands(): void {
    this.state.players[0].clearHand();
    this.state.players[1].clearHand();
    this.state.players[2].clearHand();
    this.state.players[3].clearHand();
  }

  createPlayer(playerNumber: number, name: string): void {
    const index = this.state.players.length ? this.state.players.length : 0;
    const player: Player = new Player(index, playerNumber, name);
    this.state.players.push(player);
  }

  createPlayers(): void {
    this.createPlayer(1, 'Player 1');
    this.createPlayer(2, 'Player 2');
    this.createPlayer(3, 'Player 3');
    this.createPlayer(4, 'Player 4');
  } 
}
