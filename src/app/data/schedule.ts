import { DocumentReference } from '@angular/fire/firestore';
import { Timestamp } from '@firebase/firestore-types';

export default interface Schedule {
  duration: number;
  name: string;
  speakers: DocumentReference[];
  startTime: Timestamp;
  talkRef: DocumentReference;
  description?: string;
  speaker: IntSpeaker;
  cospeaker: IntSpeaker;
}

interface IntSpeaker {
    company: string;
    language: string;
    name: string;
    photoPath: string;
    pronoun: string;
    tag: string;
    tagColor: string;
}
