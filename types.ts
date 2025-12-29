export enum StoreType {
  HYUNDAI = '현대백화점',
  SHINSEGAE = '신세계백화점',
  LOTTE = '롯데백화점'
}

export interface DataRow {
  [key: string]: any;
}

export interface ParsedFile {
  fileName: string;
  headers: string[];
  data: DataRow[];
}

export interface ColumnSelection {
  [key: string]: boolean;
}
