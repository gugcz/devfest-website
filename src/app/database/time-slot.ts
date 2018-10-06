export interface TimeSlot {
  id: string;
  text: string;
  sessions: TimeSlotItem[];
  endTime: Date;
  startTime: Date;
  primary?: boolean;
}

export interface TimeSlotItem {
  session: string;
  track: string;
}
