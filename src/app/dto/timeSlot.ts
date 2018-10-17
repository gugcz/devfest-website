import * as firebase from 'firebase';

export interface TimeSlot {
  endTime: firebase.firestore.Timestamp;
  isWorkshopDay?: boolean;
  sessions: SessionPart[];
  startTime: firebase.firestore.Timestamp;
  text: string;
  primary?: boolean;
}

interface SessionPart {
  session: firebase.firestore.DocumentReference;
  track: firebase.firestore.DocumentReference;
}
