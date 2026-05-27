'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
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

type ComplianceSuitePanelProps = {
  dashboard: ComplianceDashboard | null;
  frameworks: ComplianceFramework[];
  risks: ComplianceRisk[];
  policies: CompliancePolicy[];
  evidence: ComplianceEvidence[];
};

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function riskBadgeVariant(score: number): 'destructive' | 'secondary' | 'outline' {
  if (score >= 15) return 'destructive';
  if (score >= 8) return 'secondary';
  return 'outline';
}

export function ComplianceSuitePanel({
  dashboard,
  frameworks: initialFrameworks,
  risks: initialRisks,
  policies: initialPolicies,
  evidence: initialEvidence,
}: ComplianceSuitePanelProps) {
  const api = useMemo(() => createBrowserApiClient(), []);
  const [frameworks, setFrameworks] = useState(initialFrameworks);
  const risks = initialRisks;
  const [policies, setPolicies] = useState(initialPolicies);
  const [evidenceRows, setEvidenceRows] = useState(initialEvidence);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [policyKey, setPolicyKey] = useState('information-security');
  const [policyTitle, setPolicyTitle] = useState('Information Security Policy');
  const [policyContent, setPolicyContent] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUri, setEvidenceUri] = useState('');

  const heatmap = dashboard?.riskHeatmap;
  const matrixKeys = heatmap?.matrix ? Object.keys(heatmap.matrix) : [];

  async function handleRunTests() {
    setMessage(null);
    setError(null);
    try {
      const results = await runComplianceControlTests(api);
      setMessage(`Control tests completed (${Array.isArray(results) ? results.length : 0} runs).`);
      setFrameworks(await listComplianceFrameworks(api));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleSavePolicy() {
    setMessage(null);
    setError(null);
    try {
      const saved = await saveCompliancePolicy(api, {
        policyKey,
        title: policyTitle,
        content: policyContent,
        status: 'published',
      });
      setPolicies((current) => [saved, ...current.filter((p) => p.policyKey !== saved.policyKey || p.version !== saved.version)]);
      setMessage(`Policy ${saved.policyKey} v${saved.version} published.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleUploadEvidence() {
    setMessage(null);
    setError(null);
    try {
      const row = await uploadComplianceEvidence(api, {
        title: evidenceTitle,
        storageUri: evidenceUri || undefined,
      });
      setEvidenceRows((current) => [row, ...current]);
      setEvidenceTitle('');
      setEvidenceUri('');
      setMessage('Evidence uploaded.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleExport(reportType: string) {
    setMessage(null);
    setError(null);
    try {
      const report = await exportComplianceReport(api, { reportType, format: 'json' });
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `compliance-${reportType}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage(`Exported ${reportType} report.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Metric title="Frameworks" value={dashboard?.frameworks ?? frameworks.length} />
        <Metric title="Controls" value={dashboard?.controls ?? 0} />
        <Metric title="Risks" value={dashboard?.risks ?? risks.length} />
        <Metric title="Evidence" value={dashboard?.evidenceCount ?? evidenceRows.length} />
        <Metric title="Coverage" value={`${dashboard?.controlCoveragePercent ?? 0}%`} />
        <Metric title="Open alerts" value={dashboard?.openAlerts ?? 0} />
      </div>

      {message ? <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{message}</p> : null}
      {error ? <p className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive">{error}</p> : null}

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
              <p className="text-sm text-muted-foreground">No risk matrix data yet.</p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(heatmap?.topRisks ?? risks.slice(0, 5).map((r) => ({ id: r.id, title: r.title, score: r.residualScore }))).map(
                  (r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>
                        <Badge variant={riskBadgeVariant(r.score)}>{r.score}</Badge>
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
              <Badge variant="secondary">
                {String((dashboard?.auditCenter as { status?: string })?.status ?? 'active')}
              </Badge>
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
            <TableHeader>
              <TableRow>
                <TableHead>Framework</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frameworks.map((fw) => (
                <TableRow key={fw.id}>
                  <TableCell>{fw.displayName}</TableCell>
                  <TableCell>{fw.frameworkType}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fw.status}</Badge>
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
            <textarea
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
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.slice(0, 8).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>v{p.version}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'published' ? 'outline' : 'secondary'}>{p.status}</Badge>
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
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceRows.slice(0, 8).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.evidenceType}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.status}</Badge>
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
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Residual</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length ? (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>{risk.title}</TableCell>
                    <TableCell>{risk.likelihood}</TableCell>
                    <TableCell>{risk.impact}</TableCell>
                    <TableCell>
                      <Badge variant={riskBadgeVariant(risk.residualScore)}>{risk.residualScore}</Badge>
                    </TableCell>
                    <TableCell>{risk.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No risks registered
                  </TableCell>
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
    </div>
  );
}
