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

  getValue(): string {
    return this.primary + '-' + this.secondary;
  }
}
