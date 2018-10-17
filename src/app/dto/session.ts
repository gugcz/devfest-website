import * as firebase from 'firebase';

export interface Session {
  description?: string;
  endTime: firebase.firestore.Timestamp;
  hall: Hall;
  language?: string;
  length?: string;
  level?: string;
  name: string;
  speakers?: firebase.firestore.DocumentReference[];
  startTime: firebase.firestore.Timestamp;
  tag?: firebase.firestore.DocumentReference;
}

interface Hall {
  name: string;
  order: number;
}
