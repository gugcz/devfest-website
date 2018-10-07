export interface Talk {
  name: string;
  speakers?: Speaker[];
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
  tag: { color: string; type: string; };
}

export interface Speaker {
  name: string;
  job: string;
  city: string;
  photoUrl: string;
  photo: any;
}
