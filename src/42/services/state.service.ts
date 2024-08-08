import { Injectable } from '@angular/core';
import { Trick } from '../models/trick';
import { Bid } from '../models/bid';
import { Player } from '../models/player';
import { DominoDTO } from '../models/dominoDTO';
import { Domino } from '../models/domino';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  activePlayer!: Player;
  bid!: Bid;
  board!: Trick;
  deliberationTimeout = 1000;
  grave: Array<Trick> = [];
  hasDeclaredBid = false;
  isTestMode = false;
  leadValue = 0;
  log: Array<string> = [];
  originalSet: Array<DominoDTO> = [];
  players: Array<Player> = [];
  set: Array<Domino> = [];
  showDebugIcons = false;
  showDebugDominoes = true;
  showLog = true;
  showTrickDetails = true;
  turn = 0;
  trick = 0;
}
