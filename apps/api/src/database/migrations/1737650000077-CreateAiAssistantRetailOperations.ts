import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAiAssistantRetailOperations1737650000077 implements MigrationInterface {
  name = 'CreateAiAssistantRetailOperations1737650000077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(160) NOT NULL,
        context JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_assistant_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        conversation_id UUID NOT NULL REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
        role VARCHAR(24) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_action_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        conversation_id UUID REFERENCES ai_assistant_conversations(id) ON DELETE SET NULL,
        created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action_type VARCHAR(64) NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'pending_approval',
        risk_level VARCHAR(16) NOT NULL DEFAULT 'medium',
        payload JSONB NOT NULL DEFAULT '{}',
        approval_note TEXT,
        approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMPTZ,
        executed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_insights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        category VARCHAR(48) NOT NULL,
        severity VARCHAR(16) NOT NULL DEFAULT 'medium',
        title VARCHAR(180) NOT NULL,
        summary TEXT NOT NULL,
        recommended_action TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(24) NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_automation_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        automation_type VARCHAR(64) NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
        thresholds JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, automation_type)
      );

      CREATE TABLE IF NOT EXISTS ai_usage_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        metric_type VARCHAR(64) NOT NULL,
        count INT NOT NULL DEFAULT 1,
        estimated_savings_cents INT NOT NULL DEFAULT 0,
        accuracy_score DECIMAL(6,4),
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_conversations_tenant_created ON ai_assistant_conversations (tenant_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_assistant_messages (tenant_id, conversation_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_actions_status_created ON ai_action_requests (tenant_id, status, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_actions_type ON ai_action_requests (tenant_id, action_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_insights_category_severity ON ai_insights (tenant_id, category, severity)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ai_metrics_type_created ON ai_usage_metrics (tenant_id, metric_type, created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_metrics_type_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_insights_category_severity`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_actions_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_actions_status_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_messages_conversation_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ai_conversations_tenant_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_usage_metrics`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_automation_settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_insights`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_action_requests`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_assistant_messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS ai_assistant_conversations`);
  }
}
