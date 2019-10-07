import Schedule from './schedule';
import { Timestamp } from '@firebase/firestore-types';

export default interface Room {
  date: Timestamp;
  name: string;
  schedule: Schedule[];
}
