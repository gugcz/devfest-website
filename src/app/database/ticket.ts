export interface Ticket {
  actual: boolean;
  description: string;
  price: Price[];
  order: number;
  soldOut: boolean;
  title: string;
  support: boolean;
}

export interface Price {
  price: number;
  title: string;
}
