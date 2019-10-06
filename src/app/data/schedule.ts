import { DocumentReference } from '@angular/fire/firestore';
import { Timestamp } from '@firebase/firestore-types';

export default interface Schedule {
  duration: number;
  name: string;
  speakers: DocumentReference[];
  startTime: Timestamp;
  talkRef: DocumentReference;
  description?: string;
}
