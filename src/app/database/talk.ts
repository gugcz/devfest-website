export interface Talk {
  title: string;
  speaker: Speaker;
  level: string;
  language: string;
  length: string;
  imageUrl: string;
  technologyClass: string;
}

export interface Speaker {
  name: string;
  job: string;
  city: string;
}
