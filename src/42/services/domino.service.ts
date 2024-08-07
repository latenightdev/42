import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Domino } from '../models/domino';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class DominoService {

  constructor(private httpClient: HttpClient, private state: StateService) {}

  init(): void {
    this.loadDominoes().subscribe(response => {
      this.state.originalSet = response.set;
    });
  }

  loadDominoes(): Observable<any> {
    const url = '/assets/dominoes.json';
    return this.httpClient.get(url);
  }

  createDominoes(): void {
    const dominoes: Array<Domino> = [];
    for(let i = 0; i < this.state.originalSet.length; i++) {
      const domino: Domino = new Domino(this.state.originalSet[i]);
      dominoes.push(domino);
    }
    this.state.set = dominoes;
  }

  findHighDomino(dominoes: Array<Domino>): Domino {
    let high: Domino = dominoes[0];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        high = domino;
        return high;
      }
      if (domino.total > high.total) {
        high = domino;
      }
    }
    return high;
  }

  findLowDomino(dominoes: Array<Domino>): Domino {
    let low: Domino = dominoes[0];
    for(let i = 1; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.total < low.total && !domino.isDouble) {
        low = domino;
      }
    }
    return low;
  }

  findTrumps(dominoes: Array<Domino>, trump: number): Array<Domino> {
    let trumps = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.primary === trump || domino.secondary === trump) {
        trumps.push(domino);
      }
    }
    return trumps;
  }

  findDoubles(dominoes: Array<Domino>): Array<Domino> {
    let doubles = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        doubles.push(domino);
      }
    }
    return doubles;
  }  
}
