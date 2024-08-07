import { Component, EventEmitter, Output } from '@angular/core';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'trick',
  templateUrl: './trick.component.html',
  styleUrl: './trick.component.less'
})
export class TrickComponent {
  @Output() emitNextTrick: EventEmitter<string> = new EventEmitter<string>();

  constructor(public state: StateService) {}

  onClickNext(): void {
    this.emitNextTrick.emit();
  }
}
