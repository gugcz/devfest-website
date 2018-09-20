export interface Talk {
  title: string;
  speaker?: Speaker;
  level?: string;
  language?: string;
  length?: string;
  technologyClass?: string;
  columnStart?: number;
  columnEnd?: number;
  trackNumber?: number;
  hall: string;
  rowStart: number;
  rowEnd: number;
}

export interface Speaker {
  name: string;
  job: string;
  city: string;
  imageUrl: string;
}
