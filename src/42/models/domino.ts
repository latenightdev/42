import { DominoDTO } from "./dominioDTO";

export class Domino {
  id: number;
  primaryName: string;
  secondaryName: string;
  primary: number;
  secondary: number;
  total: number;
  isDouble: boolean;
  isCount: boolean;
  
  constructor(dominoDTO: DominoDTO) {
    this.id = dominoDTO.id;
    this.primaryName = dominoDTO.primaryName;
    this.secondaryName = dominoDTO.secondaryName;
    this.primary = dominoDTO.primary;
    this.secondary = dominoDTO.secondary;
    this.total = dominoDTO.total;
    this.isDouble = dominoDTO.isDouble;
    this.isCount = dominoDTO.isCount;
  }

  getValue(trump: number): string {
    return this.secondary === trump ? this.secondary + '-' + this.primary : this.primary + '-' + this.secondary;
  }

  getName(trump: number): string {
    return this.secondary === trump ? this.secondaryName : this.primaryName;
  }

  isLead(lead: number): boolean {
    return this.primary === lead || this.secondary === lead;
  }
}
