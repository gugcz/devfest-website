import { Ticket } from "src/app/data/ticket-group";

export interface TicketView extends Ticket {
    title: string;
    price: number;
    eur_price: number;
    active: boolean;
    sold_out: boolean;
    start: string;
    end: string;
    description: string;
    url: string;
}
