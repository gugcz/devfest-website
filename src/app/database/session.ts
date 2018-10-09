export interface Session {
  description: string;
  startTime: Date;
  endTime: string;
  name: string;
  rowStart?: number;
  rowEnd?: number;
  columnStart?: number;
  columnEnd?: number;
}
