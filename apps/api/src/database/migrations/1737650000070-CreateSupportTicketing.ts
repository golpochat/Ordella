import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportTicketing1737650000070 implements MigrationInterface {
  name = 'CreateSupportTicketing1737650000070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        delivery_task_id UUID REFERENCES delivery_tasks(id) ON DELETE SET NULL,
        subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
        subject VARCHAR(180) NOT NULL,
        description TEXT,
        category VARCHAR(32) NOT NULL,
        priority VARCHAR(16) NOT NULL DEFAULT 'medium',
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        source VARCHAR(32) NOT NULL DEFAULT 'customer_portal',
        assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
        first_response_due_at TIMESTAMPTZ,
        first_responded_at TIMESTAMPTZ,
        sla_due_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        closed_at TIMESTAMPTZ,
        escalated_at TIMESTAMPTZ,
        csat_rating INT,
        csat_comment TEXT,
        attachments JSONB NOT NULL DEFAULT '[]',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets (tenant_id, status, priority)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets (tenant_id, customer_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets (tenant_id, assigned_to_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets (tenant_id, category)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        author_type VARCHAR(16) NOT NULL,
        author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        author_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        internal_only BOOLEAN NOT NULL DEFAULT false,
        attachments JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_created ON support_ticket_messages (tenant_id, ticket_id, created_at)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        type VARCHAR(64) NOT NULL,
        actor_user_id UUID,
        actor_customer_id UUID,
        from_value VARCHAR(120),
        to_value VARCHAR(120),
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_support_ticket_events_ticket_created ON support_ticket_events (tenant_id, ticket_id, created_at)`);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES
        ('support.read', 'Read support tickets'),
        ('support.write', 'Create and update support tickets'),
        ('support.assign', 'Assign support tickets to staff'),
        ('support.analytics', 'View support analytics')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_ticket_events_ticket_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS support_ticket_events`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_ticket_messages_ticket_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS support_ticket_messages`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_tickets_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_tickets_assigned`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_tickets_customer`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_support_tickets_status_priority`);
    await queryRunner.query(`DROP TABLE IF EXISTS support_tickets`);
  }
}
