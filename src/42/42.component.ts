import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { Bid } from './models/bid';

@Component({
  selector: 'root-42',
  templateUrl: './42.component.html',
  styleUrl: './42.component.less'
})
export class Component42 implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit() {
    this.gameService.init();
    this.setPlayers();
  }

  setPlayers() {
    this.gameService.createPlayer(1, 'Ryan');
    this.gameService.createPlayer(2, 'Player 2');
    this.gameService.createPlayer(3, 'Player 3');
    this.gameService.createPlayer(4, 'Player 4');
  }

  onDeclareBid(bid: Bid) {
    this.gameService.hasDeclaredBid = true;
    this.gameService.bid = bid;
  }

  onClickDeal() {
    this.gameService.dealNewHand();
  }
}
