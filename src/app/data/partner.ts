export interface Partner {
  name: string;
  order: number;
  top: boolean;
  main: boolean;
  companies: Company[];
}

export interface Company {
  name: string;
  url: string;
  photoPath: string;
}
