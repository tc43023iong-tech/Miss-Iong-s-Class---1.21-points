
export interface Student {
  id: string; // School ID/Number
  name: string;
  points: number;
  plusCount: number;
  minusCount: number;
  pokemonId: number;
}

export interface ClassData {
  className: string;
  students: Student[];
}

export interface Action {
  textZh: string;
  textEn: string;
  points: number;
  type: 'positive' | 'negative';
}

export enum SortType {
  ID = 'ID',
  NAME = 'NAME',
  SCORE_DESC = 'SCORE_DESC',
  SCORE_ASC = 'SCORE_ASC'
}
