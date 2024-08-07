import { Component, Input } from '@angular/core';

@Component({
  selector: 'domino',
  templateUrl: './domino.component.html',
  styleUrl: './domino.component.less'
})
export class DominoComponent {
  @Input() primary!: number;
  @Input() secondary!: number;
  @Input() selected!: boolean;
  @Input() showFace?: boolean = true;
}
