import { SupportTicketEntity } from './support-ticket.entity';
import { SupportTicketEventEntity } from './support-ticket-event.entity';
import { SupportTicketMessageEntity } from './support-ticket-message.entity';

export { SupportTicketEntity } from './support-ticket.entity';
export { SupportTicketEventEntity } from './support-ticket-event.entity';
export { SupportTicketMessageEntity } from './support-ticket-message.entity';
export {
  SupportMessageAuthorType,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus,
} from './support-ticket.enums';

export const SUPPORT_ENTITIES = [
  SupportTicketEntity,
  SupportTicketMessageEntity,
  SupportTicketEventEntity,
];
