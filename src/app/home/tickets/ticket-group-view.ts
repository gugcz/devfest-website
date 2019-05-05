import {TicketGroup} from '../../data/ticket-group';
import {TicketView} from './ticket-view';

export interface TicketGroupView extends TicketGroup {
  tickets: TicketView[];
}
