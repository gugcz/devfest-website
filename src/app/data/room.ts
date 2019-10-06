import Schedule from './schedule';

export default interface Room {
  date: Date;
  name: string;
  schedule: Schedule[];
}
