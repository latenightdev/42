import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.less'
})
export class NavigationComponent {
  @Output() emitNewGame: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitDebugGame: EventEmitter<string> = new EventEmitter<string>();

  onClickNew(): void {
    this.emitNewGame.emit();
  }

  onClickDebug(): void {
    this.emitDebugGame.emit();
  }
}
