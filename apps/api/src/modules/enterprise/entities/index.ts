import { EnterpriseAccessAssignmentEntity } from './enterprise-access-assignment.entity';
import { EnterpriseOrganizationEntity } from './enterprise-organization.entity';
import { EnterpriseRegionEntity } from './enterprise-region.entity';

export { EnterpriseAccessAssignmentEntity } from './enterprise-access-assignment.entity';
export type { EnterpriseScopeType } from './enterprise-access-assignment.entity';
export { EnterpriseOrganizationEntity } from './enterprise-organization.entity';
export { EnterpriseRegionEntity } from './enterprise-region.entity';

export const ENTERPRISE_ENTITIES = [
  EnterpriseAccessAssignmentEntity,
  EnterpriseOrganizationEntity,
  EnterpriseRegionEntity,
];
