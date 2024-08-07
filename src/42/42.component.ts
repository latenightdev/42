import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { Bid } from './models/bid';
import { Domino } from './models/domino';
import { PlayerService } from './services/player.service';
import { DominoService } from './services/domino.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'root-42',
  templateUrl: './42.component.html',
  styleUrl: './42.component.less'
})
export class Component42 implements OnInit {

  constructor(
    public gameService: GameService,
    private playerService: PlayerService,
    private dominoService: DominoService,
    public state: StateService
  ) {}

  ngOnInit(): void {
    this.dominoService.init();
    this.playerService.init();
  }

  onDeclareBid(bid: Bid): void {
    this.state.hasDeclaredBid = true;
    this.state.bid = bid;
  }

  onEmitNew(): void {
    this.gameService.dealNewHand();
  }

  onEmitDebug(): void {
    this.gameService.dealTestHand();
  }

  onEmitNext(): void {
    this.playerService.endTrick();
  }

  onClickGrave(domino: Domino): void {
    this.gameService.dealTestDomino(domino);
  }
}
