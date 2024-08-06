import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { Bid } from './models/bid';
import { Domino } from './models/domino';

@Component({
  selector: 'root-42',
  templateUrl: './42.component.html',
  styleUrl: './42.component.less'
})
export class Component42 implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.init();
    this.setPlayers();
  }

  setPlayers(): void {
    this.gameService.createPlayer(1, 'Ryan');
    this.gameService.createPlayer(2, 'Player 2');
    this.gameService.createPlayer(3, 'Player 3');
    this.gameService.createPlayer(4, 'Player 4');
  }

  onDeclareBid(bid: Bid): void {
    this.gameService.hasDeclaredBid = true;
    this.gameService.bid = bid;
  }

  onEmitNew(): void {
    this.gameService.dealNewHand();
  }

  onEmitDebug(): void {
    this.gameService.dealTestHand();
  }

  onEmitNext(): void {
    this.gameService.endTrick();
  }

  onClickGrave(domino: Domino): void {
    this.gameService.dealTestDomino(domino);
  }
}
