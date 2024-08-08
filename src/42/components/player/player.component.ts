import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../../models/player';
import { Domino } from '../../models/domino';
import { GameService } from '../../services/game.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.less'
})
export class PlayerComponent implements OnInit {

  @Input() player!: Player;

  constructor(
    public gameService: GameService,
    public state: StateService
  ) {}

  ngOnInit() {
  }

  clickDomino(domino: Domino): void {
    if (this.player.number === 1 && this.player === this.state.activePlayer) {
      this.selectDomino(domino);
    }
  }

  selectDomino(domino: Domino): void {
    this.player.selectDomino(domino);
  }

  isDominoSelected(domino: Domino): boolean {
    return this.player.selected.indexOf(domino) !== -1;
  }

  playDomino(): void {
    if (this.state.board.set.length === 0) {
      this.gameService.leadWithDomino(this.player.selected[0]);
    } else {
      this.gameService.followWithDomino(this.player.selected[0]);
    }
  }

  showDomino(): boolean {
    return this.player.index === 0 || this.state.showDebugDominoes;
  }
}
