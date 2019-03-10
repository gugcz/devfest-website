import { TicketGroup } from "src/app/dto/ticket-group";
import { TicketView } from './ticket-view';

export interface TicketGroupView extends TicketGroup {
    tickets: TicketView[];
}
