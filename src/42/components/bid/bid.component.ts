import { Component, EventEmitter, Output } from '@angular/core';
import { Bid } from '../../models/bid';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'bid',
  templateUrl: './bid.component.html',
  styleUrl: './bid.component.less'
})
export class BidComponent {

  public bid!: Bid;
  @Output() emitBid: EventEmitter<Bid> = new EventEmitter<Bid>();

  constructor(public state: StateService) {}

  ngOnInit() {
    this.bid = new Bid();
  }

  declareBid(): void {
    this.bid.trump = Number(this.bid.trump);
    this.bid.bid = Number(this.bid.bid);
    this.emitBid.emit(this.bid);
  }
}
