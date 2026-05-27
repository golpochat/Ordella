import { WorkflowApprovalEntity } from './workflow-approval.entity';
import { WorkflowDeadLetterEntity } from './workflow-dead-letter.entity';
import { WorkflowRunEntity } from './workflow-run.entity';
import { WorkflowStepRunEntity } from './workflow-step-run.entity';
import { WorkflowStepEntity } from './workflow-step.entity';
import { WorkflowTriggerEntity } from './workflow-trigger.entity';
import { WorkflowVersionEntity } from './workflow-version.entity';
import { WorkflowEntity } from './workflow.entity';

export { WorkflowApprovalEntity } from './workflow-approval.entity';
export { WorkflowDeadLetterEntity } from './workflow-dead-letter.entity';
export { WorkflowRunEntity } from './workflow-run.entity';
export { WorkflowStepRunEntity } from './workflow-step-run.entity';
export { WorkflowStepEntity, type WorkflowStepType } from './workflow-step.entity';
export { WorkflowTriggerEntity, type WorkflowTriggerType } from './workflow-trigger.entity';
export { WorkflowVersionEntity } from './workflow-version.entity';
export { WorkflowEntity, type WorkflowStatus } from './workflow.entity';

export const ORCHESTRATION_ENTITIES = [
  WorkflowApprovalEntity,
  WorkflowDeadLetterEntity,
  WorkflowEntity,
  WorkflowRunEntity,
  WorkflowStepEntity,
  WorkflowStepRunEntity,
  WorkflowTriggerEntity,
  WorkflowVersionEntity,
];
