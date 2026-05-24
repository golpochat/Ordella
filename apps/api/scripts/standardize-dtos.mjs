import fs from 'fs';
import path from 'path';

const modulesRoot = path.resolve('src/modules');
const apiSrc = path.resolve('src');

const fileRenames = [
  ['auth/dto/pagination-query.dto.ts', 'auth/dto/filter-pagination.dto.ts', 'PaginationQueryDto', 'FilterPaginationDto'],
  ['payments/dto/payment-attempts/payment-attempt-query.dto.ts', 'payments/dto/payment-attempts/filter-payment-attempt.dto.ts', 'PaymentAttemptQueryDto', 'FilterPaymentAttemptDto'],
  ['promotions/dto/promotion-rules/promotion-rule-query.dto.ts', 'promotions/dto/promotion-rules/filter-promotion-rule.dto.ts', 'PromotionRuleQueryDto', 'FilterPromotionRuleDto'],
  ['promotions/dto/promotion-conditions/promotion-condition-query.dto.ts', 'promotions/dto/promotion-conditions/filter-promotion-condition.dto.ts', 'PromotionConditionQueryDto', 'FilterPromotionConditionDto'],
  ['promotions/dto/promotion-applications/promotion-application-query.dto.ts', 'promotions/dto/promotion-applications/filter-promotion-application.dto.ts', 'PromotionApplicationQueryDto', 'FilterPromotionApplicationDto'],
  ['reports/dto/reports/report-date-range-query.dto.ts', 'reports/dto/reports/filter-report-date-range.dto.ts', 'ReportDateRangeQueryDto', 'FilterReportDateRangeDto'],
  ['reports/dto/report-jobs/report-job-query.dto.ts', 'reports/dto/report-jobs/filter-report-job.dto.ts', 'ReportJobQueryDto', 'FilterReportJobDto'],
  ['reports/dto/report-results/report-result-query.dto.ts', 'reports/dto/report-results/filter-report-result.dto.ts', 'ReportResultQueryDto', 'FilterReportResultDto'],
  ['integrations/dto/integration-logs/integration-log-query.dto.ts', 'integrations/dto/integration-logs/filter-integration-log.dto.ts', 'IntegrationLogQueryDto', 'FilterIntegrationLogDto'],
  ['integrations/dto/integration-events/integration-event-query.dto.ts', 'integrations/dto/integration-events/filter-integration-event.dto.ts', 'IntegrationEventQueryDto', 'FilterIntegrationEventDto'],
  ['notifications/dto/notification-logs/notification-log-query.dto.ts', 'notifications/dto/notification-logs/filter-notification-log.dto.ts', 'NotificationLogQueryDto', 'FilterNotificationLogDto'],
  ['deliveries/dto/delivery-assignments/delivery-assignment-query.dto.ts', 'deliveries/dto/delivery-assignments/filter-delivery-assignment.dto.ts', 'DeliveryAssignmentQueryDto', 'FilterDeliveryAssignmentDto'],
  ['integrations/dto/integrations/connect-integration-app.dto.ts', 'integrations/dto/integrations/create-integration-app.dto.ts', 'ConnectIntegrationAppDto', 'CreateIntegrationAppDto'],
  ['integrations/dto/integrations/integration-webhook.dto.ts', 'integrations/dto/integrations/create-integration-webhook.dto.ts', 'IntegrationWebhookDto', 'CreateIntegrationWebhookDto'],
  ['reports/dto/reports/export-report.dto.ts', 'reports/dto/reports/create-export-report.dto.ts', 'ExportReportDto', 'CreateExportReportDto'],
  ['orders/dto/orders/create-order-item-input.dto.ts', 'orders/dto/orders/create-order-nested-item.dto.ts', 'CreateOrderItemInputDto', 'CreateOrderNestedItemDto'],
  ['auth/dto/authentication/login.dto.ts', 'auth/dto/authentication/create-login.dto.ts', 'LoginDto', 'CreateLoginDto'],
  ['auth/dto/authentication/pin-login.dto.ts', 'auth/dto/authentication/create-pin-login.dto.ts', 'PinLoginDto', 'CreatePinLoginDto'],
  ['auth/dto/authentication/logout.dto.ts', 'auth/dto/authentication/create-logout.dto.ts', 'LogoutDto', 'CreateLogoutDto'],
  ['auth/dto/authentication/mfa-verify.dto.ts', 'auth/dto/authentication/create-mfa-verify.dto.ts', 'MfaVerifyDto', 'CreateMfaVerifyDto'],
  ['auth/dto/authentication/refresh-token.dto.ts', 'auth/dto/authentication/create-refresh-token.dto.ts', 'RefreshTokenDto', 'CreateRefreshTokenDto'],
  ['auth/dto/roles/assign-permissions.dto.ts', 'auth/dto/roles/update-role-permissions.dto.ts', 'AssignPermissionsDto', 'UpdateRolePermissionsDto'],
  ['deliveries/dto/deliveries/delivery-tracking-point.dto.ts', 'deliveries/dto/deliveries/delivery-tracking-point-response.dto.ts', 'DeliveryTrackingPointDto', 'DeliveryTrackingPointResponseDto'],
];

const importSuffixMap = [
  ['pagination-query.dto', 'filter-pagination.dto'],
  ['payment-attempt-query.dto', 'filter-payment-attempt.dto'],
  ['promotion-rule-query.dto', 'filter-promotion-rule.dto'],
  ['promotion-condition-query.dto', 'filter-promotion-condition.dto'],
  ['promotion-application-query.dto', 'filter-promotion-application.dto'],
  ['report-date-range-query.dto', 'filter-report-date-range.dto'],
  ['report-job-query.dto', 'filter-report-job.dto'],
  ['report-result-query.dto', 'filter-report-result.dto'],
  ['integration-log-query.dto', 'filter-integration-log.dto'],
  ['integration-event-query.dto', 'filter-integration-event.dto'],
  ['notification-log-query.dto', 'filter-notification-log.dto'],
  ['delivery-assignment-query.dto', 'filter-delivery-assignment.dto'],
  ['connect-integration-app.dto', 'create-integration-app.dto'],
  ['integration-webhook.dto', 'create-integration-webhook.dto'],
  ['export-report.dto', 'create-export-report.dto'],
  ['create-order-item-input.dto', 'create-order-nested-item.dto'],
  ['login.dto', 'create-login.dto'],
  ['pin-login.dto', 'create-pin-login.dto'],
  ['logout.dto', 'create-logout.dto'],
  ['mfa-verify.dto', 'create-mfa-verify.dto'],
  ['refresh-token.dto', 'create-refresh-token.dto'],
  ['assign-permissions.dto', 'update-role-permissions.dto'],
  ['delivery-tracking-point.dto', 'delivery-tracking-point-response.dto'],
  ['location-settings.dto', 'update-location-settings.dto'],
  ['location-opening-hours.dto', 'update-location-opening-hours.dto'],
  ['stock-adjustment.dto', 'create-stock-adjustment.dto'],
  ['stock-reservation.dto', 'create-stock-reservation.dto'],
  ['wastage-record.dto', 'create-wastage-record.dto'],
  ['stock-transfer.dto', 'create-stock-transfer.dto'],
];

const classRenames = [
  ['PaginationQueryDto', 'FilterPaginationDto'],
  ['PaymentAttemptQueryDto', 'FilterPaymentAttemptDto'],
  ['PromotionRuleQueryDto', 'FilterPromotionRuleDto'],
  ['PromotionConditionQueryDto', 'FilterPromotionConditionDto'],
  ['PromotionApplicationQueryDto', 'FilterPromotionApplicationDto'],
  ['ReportDateRangeQueryDto', 'FilterReportDateRangeDto'],
  ['ReportJobQueryDto', 'FilterReportJobDto'],
  ['ReportResultQueryDto', 'FilterReportResultDto'],
  ['IntegrationLogQueryDto', 'FilterIntegrationLogDto'],
  ['IntegrationEventQueryDto', 'FilterIntegrationEventDto'],
  ['NotificationLogQueryDto', 'FilterNotificationLogDto'],
  ['DeliveryAssignmentQueryDto', 'FilterDeliveryAssignmentDto'],
  ['ConnectIntegrationAppDto', 'CreateIntegrationAppDto'],
  ['IntegrationWebhookDto', 'CreateIntegrationWebhookDto'],
  ['ExportReportDto', 'CreateExportReportDto'],
  ['CreateOrderItemInputDto', 'CreateOrderNestedItemDto'],
  ['LoginDto', 'CreateLoginDto'],
  ['PinLoginDto', 'CreatePinLoginDto'],
  ['LogoutDto', 'CreateLogoutDto'],
  ['MfaVerifyDto', 'CreateMfaVerifyDto'],
  ['RefreshTokenDto', 'CreateRefreshTokenDto'],
  ['AssignPermissionsDto', 'UpdateRolePermissionsDto'],
  ['DeliveryTrackingPointDto', 'DeliveryTrackingPointResponseDto'],
  ['ModifierOptionInputDto', 'CreateModifierOptionDto'],
  ['OpeningHoursEntryDto', 'CreateOpeningHoursEntryDto'],
  ['StockTransferLineDto', 'CreateStockTransferLineDto'],
];

for (const [oldRel, newRel, oldClass, newClass] of fileRenames) {
  const oldPath = path.join(modulesRoot, oldRel);
  const newPath = path.join(modulesRoot, newRel);
  if (!fs.existsSync(oldPath)) continue;
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  let content = fs.readFileSync(oldPath, 'utf8');
  if (oldClass !== newClass) {
    content = content.replace(new RegExp(`\\b${oldClass}\\b`, 'g'), newClass);
  }
  content = content.replace(/\bPaginationQueryDto\b/g, 'FilterPaginationDto');
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
}

const filesToDelete = [
  'inventory/dto/stock-adjustments/stock-adjustment.dto.ts',
  'inventory/dto/stock-reservations/stock-reservation.dto.ts',
  'inventory/dto/wastage/wastage-record.dto.ts',
  'inventory/dto/stock-transfers/stock-transfer.dto.ts',
  'tenants/dto/locations/location-settings.dto.ts',
  'tenants/dto/locations/location-opening-hours.dto.ts',
];

for (const rel of filesToDelete) {
  const p = path.join(modulesRoot, rel);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(p, files);
    else if (ent.name.endsWith('.ts')) files.push(p);
  }
  return files;
}

for (const file of walkDir(apiSrc)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [oldClass, newClass] of classRenames) {
    content = content.replace(new RegExp(`\\b${oldClass}\\b`, 'g'), newClass);
  }
  for (const [oldSuf, newSuf] of importSuffixMap) {
    content = content.split(oldSuf).join(newSuf);
  }
  if (content !== original) fs.writeFileSync(file, content);
}

console.log('Done');
