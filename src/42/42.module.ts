import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { Component42 } from './42.component';
import { PlayerComponent } from './components/player/player.component';
import { DominoComponent } from './components/domino/domino.component';
import { BidComponent } from './components/bid/bid.component';

@NgModule({
  declarations: [
    Component42,
    PlayerComponent,
    DominoComponent,
    BidComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 1000
    }),
    FormsModule,
    HttpClientModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [Component42]
})
export class Module42 { }
