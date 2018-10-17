import * as firebase from 'firebase';

export interface TimeSlot {
  endTime: firebase.firestore.Timestamp;
  isWorkshopDay?: boolean;
  sessions: TimeSlotPart[];
  startTime: firebase.firestore.Timestamp;
  text: string;
  primary?: boolean;
}

export interface TimeSlotPart {
  session: firebase.firestore.DocumentReference;
  track: firebase.firestore.DocumentReference;
}
