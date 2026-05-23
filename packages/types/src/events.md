# Domain events (event bus)

Published via RabbitMQ per architecture blueprint.

## Order

- `order.created`
- `order.accepted`
- `order.preparing`
- `order.ready`
- `order.dispatched`
- `order.delivered`

## Payment

- `payment.success`
- `payment.failed`

## Delivery

- `delivery.assigned`
- `delivery.completed`
