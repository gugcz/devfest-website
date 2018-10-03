export interface Ticket {
  actual: boolean;
  description: string;
  price: Price[];
  order: number;
  soldOut: boolean;
  title: string;
  support: boolean;
  url: string;
}

export interface TicketDescription {
  id: string;
  text: string;
}

export interface Price {
  price: number;
  title: string;
}
