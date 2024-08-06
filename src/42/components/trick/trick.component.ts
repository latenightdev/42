import { Component, EventEmitter, Output } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'trick',
  templateUrl: './trick.component.html',
  styleUrl: './trick.component.less'
})
export class TrickComponent {
  @Output() emitNextTrick: EventEmitter<string> = new EventEmitter<string>();

  constructor(public gameService: GameService) { }

  onClickNext(): void {
    this.emitNextTrick.emit();
  }
}
