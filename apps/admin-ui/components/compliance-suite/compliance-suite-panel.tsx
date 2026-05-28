'use client';

import { Tag, TagLabel, type TagVariant } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack, Textarea } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  exportComplianceReport,
  listComplianceFrameworks,
  runComplianceControlTests,
  saveCompliancePolicy,
  uploadComplianceEvidence,
  type ComplianceDashboard,
  type ComplianceEvidence,
  type ComplianceFramework,
  type CompliancePolicy,
  type ComplianceRisk,
} from '@/lib/api/admin/compliance-suite';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricGrid } from '@/components/ui/admin-card';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

type ComplianceSuitePanelProps = {
  dashboard: ComplianceDashboard | null;
  frameworks: ComplianceFramework[];
  risks: ComplianceRisk[];
  policies: CompliancePolicy[];
  evidence: ComplianceEvidence[];
};


function riskTagVariant(score: number): TagVariant {
  if (score >= 15) return 'error';
  if (score >= 8) return 'warning';
  return 'neutral';
}

export function ComplianceSuitePanel({
  dashboard,
  frameworks: initialFrameworks,
  risks: initialRisks,
  policies: initialPolicies,
  evidence: initialEvidence,
}: ComplianceSuitePanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const [frameworks, setFrameworks] = useState(initialFrameworks);
  const risks = initialRisks;
  const [policies, setPolicies] = useState(initialPolicies);
  const [evidenceRows, setEvidenceRows] = useState(initialEvidence);
    const [policyKey, setPolicyKey] = useState('information-security');
  const [policyTitle, setPolicyTitle] = useState('Information Security Policy');
  const [policyContent, setPolicyContent] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUri, setEvidenceUri] = useState('');

  const heatmap = dashboard?.riskHeatmap;
  const matrixKeys = heatmap?.matrix ? Object.keys(heatmap.matrix) : [];

  async function handleRunTests() {
    try {
      const results = await runComplianceControlTests(api);
      toastSuccess(`Control tests completed (${Array.isArray(results) ? results.length : 0} runs).`);
      setFrameworks(await listComplianceFrameworks(api));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleSavePolicy() {
    try {
      const saved = await saveCompliancePolicy(api, {
        policyKey,
        title: policyTitle,
        content: policyContent,
        status: 'published',
      });
      setPolicies((current) => [saved, ...current.filter((p) => p.policyKey !== saved.policyKey || p.version !== saved.version)]);
      toastSuccess(`Policy ${saved.policyKey} v${saved.version} published.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleUploadEvidence() {
    try {
      const row = await uploadComplianceEvidence(api, {
        title: evidenceTitle,
        storageUri: evidenceUri || undefined,
      });
      setEvidenceRows((current) => [row, ...current]);
      setEvidenceTitle('');
      setEvidenceUri('');
      toastSuccess('Evidence uploaded.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function handleExport(reportType: string) {
    try {
      const report = await exportComplianceReport(api, { reportType, format: 'json' });
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `compliance-${reportType}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toastSuccess(`Exported ${reportType} report.`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={6}>
        <Metric title="Frameworks" value={dashboard?.frameworks ?? frameworks.length} />
        <Metric title="Controls" value={dashboard?.controls ?? 0} />
        <Metric title="Risks" value={dashboard?.risks ?? risks.length} />
        <Metric title="Evidence" value={dashboard?.evidenceCount ?? evidenceRows.length} />
        <Metric title="Coverage" value={`${dashboard?.controlCoveragePercent ?? 0}%`} />
        <Metric title="Open alerts" value={dashboard?.openAlerts ?? 0} />
      </MetricGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk heatmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matrixKeys.length ? (
              <div className="grid grid-cols-5 gap-1 text-center text-xs">
                {matrixKeys.map((key) => (
                  <div key={key} className="rounded border bg-muted/30 p-2">
                    <div className="font-mono">{key}</div>
                    <div className="text-lg font-semibold">{heatmap?.matrix[key] ?? 0}</div>
                  </div>
                ))}
              </div>
            ) : (
              <PanelEmpty title="No risk matrix data yet" description="Content will appear here when available." />
            )}
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {(heatmap?.topRisks ?? risks.slice(0, 5).map((r) => ({ id: r.id, title: r.title, score: r.residualScore }))).map(
                  (r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>
                        <Tag variant={riskTagVariant(r.score)}><TagLabel>{r.score}</TagLabel></Tag>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit center & monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Audit compliance:{' '}
              <Tag variant="neutral"><TagLabel>
                {String((dashboard?.auditCenter as { status?: string })?.status ?? 'active')}
              </TagLabel></Tag>
            </p>
            <p>MFA enforced: {dashboard?.security?.mfaEnforced ? 'Yes' : 'No'}</p>
            <p>Active SSO providers: {String(dashboard?.security?.ssoProvidersActive ?? 0)}</p>
            <p>SIEM: {String(dashboard?.monitoring?.siemIntegration ?? 'webhook_ready')}</p>
            <p>Compliance drift alerts: {String(dashboard?.monitoring?.complianceDrift ?? 0)}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" size="sm" onClick={() => void handleRunTests()}>
                Run control tests
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void handleExport('full_audit')}>
                Export audit bundle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Framework</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {frameworks.map((fw) => (
                <TableRow key={fw.id}>
                  <TableCell>{fw.displayName}</TableCell>
                  <TableCell>{fw.frameworkType}</TableCell>
                  <TableCell>
                    <Tag variant="outline"><TagLabel>{fw.status}</TagLabel></Tag>
                  </TableCell>
                  <TableCell>{fw.controlCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Policy editor (versioned)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={policyKey} onChange={(e) => setPolicyKey(e.target.value)} placeholder="policy key" />
            <Input value={policyTitle} onChange={(e) => setPolicyTitle(e.target.value)} placeholder="title" />
            <Textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={policyContent}
              onChange={(e) => setPolicyContent(e.target.value)}
              placeholder="Policy content (markdown supported)"
              rows={6}
            />
            <Button type="button" onClick={() => void handleSavePolicy()}>
              Publish policy version
            </Button>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {policies.slice(0, 8).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>v{p.version}</TableCell>
                    <TableCell>
                      <Tag variant={p.status === 'published' ? 'outline' : 'neutral'}><TagLabel>{p.status}</TagLabel></Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} placeholder="Evidence title" />
            <Input
              value={evidenceUri}
              onChange={(e) => setEvidenceUri(e.target.value)}
              placeholder="Storage URI (optional)"
            />
            <Button type="button" onClick={() => void handleUploadEvidence()} disabled={!evidenceTitle.trim()}>
              Upload evidence
            </Button>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {evidenceRows.slice(0, 8).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.evidenceType}</TableCell>
                    <TableCell>
                      <Tag variant="neutral"><TagLabel>{row.status}</TagLabel></Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk register</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Residual</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {risks.length ? (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>{risk.title}</TableCell>
                    <TableCell>{risk.likelihood}</TableCell>
                    <TableCell>{risk.impact}</TableCell>
                    <TableCell>
                      <Tag variant={riskTagVariant(risk.residualScore)}><TagLabel>{risk.residualScore}</TagLabel></Tag>
                    </TableCell>
                    <TableCell>{risk.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="p-0"><PanelEmpty title="No risks registered" description="Transactions and activity will appear here." size="compact" className="max-w-none border-0 shadow-none" /></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auditor portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Read-only auditor access uses dedicated credentials. Create an auditor via{' '}
            <span className="font-mono">POST /compliance-suite/auditors</span>, then sign in at{' '}
            <span className="font-mono">POST /compliance-suite/auditor/login</span>.
          </p>
          <p>Auditors receive a scoped JWT and can fetch the compliance bundle without admin permissions.</p>
        </CardContent>
      </Card>
    </Stack>
  );
}
