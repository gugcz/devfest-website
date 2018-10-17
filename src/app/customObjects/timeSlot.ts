export interface TimeSlot {
  id: string;
  text: string;
  sessions: TimeSlotItem[];
  endTime: Date;
  startTime: Date;
  primary?: boolean;
  rowsCount: number;
  isWorkshopDay?: boolean;
}

export interface TimeSlotItem {
  session: { id: any };
  track: { id: any };
}
