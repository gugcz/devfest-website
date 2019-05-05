export interface TicketGroup {
  name: string;
  order: number;
  tickets: Ticket[];
  showDescription?: boolean;
  showCount?: boolean;
  showEnd?: boolean;
  showStart?: boolean;
  hideTicketName?: boolean;
  additionalInfoDescription?: string;
  additionalInfo?: string;
  customDescription?: string;
}

export interface Ticket {
  titoName: string;
  publicName: string;
}
