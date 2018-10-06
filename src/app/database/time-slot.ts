export interface TimeSlot {
  id: string;
  text: string;
  sessions: TimeSlotItem[];
  endTime: Date;
  startTime: Date;
  primary?: boolean;
  rowsCount: number;
}

export interface TimeSlotItem {
  session: string;
  track: {id: any};
}
