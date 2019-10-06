import { DocumentReference } from '@angular/fire/firestore';

export default interface Schedule {
  duration: number;
  name: string;
  speakers: DocumentReference[];
  startTime: Date;
  talkRef: DocumentReference;
  description?: string;
}
