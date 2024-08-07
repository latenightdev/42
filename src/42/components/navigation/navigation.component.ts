import { Component, EventEmitter, Output } from '@angular/core';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.less'
})
export class NavigationComponent {
  @Output() emitNewGame: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitDebugGame: EventEmitter<string> = new EventEmitter<string>();

  constructor(public state: StateService) {}

  onClickNew(): void {
    this.emitNewGame.emit();
  }

  onClickDebug(): void {
    this.emitDebugGame.emit();
  }

  onClickToggleDebugIcons(): void {
    this.state.showDebugIcons = !this.state.showDebugIcons;
  }

  onClickToggleDebugDominoes(): void {
    this.state.showDebugDominoes = !this.state.showDebugDominoes;
  }

  onClickToggleLog(): void {
    this.state.showLog = !this.state.showLog;
  }
  
  onClickToggleTrickDetails(): void {
    this.state.showTrickDetails = !this.state.showTrickDetails;
  }  
}
