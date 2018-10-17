import * as firebase from 'firebase';

export interface Speaker {
  about: string;
  cardPosition?: number;
  companies: firebase.firestore.DocumentReference[];
  company: string;
  job: string;
  name: string;
  photo: string;
  session?: firebase.firestore.DocumentReference;
  shareId?: string;
  show: boolean;
  facebook?: string;
  googleplus?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}
