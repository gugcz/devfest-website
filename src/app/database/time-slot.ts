export interface TimeSlot {
  id: string;
  text: string;
  sessions: TimeSlotItem[];
  endTime: string;
  startTime: string;
  primary?: boolean;
}

export interface TimeSlotItem {
  session: string;
  track: string;
}
