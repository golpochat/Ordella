'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  generateAiInsights,
  listAiMessages,
  reviewAiAction,
  sendAiMessage,
  updateAiAutomationSetting,
  type AiAction,
  type AiAnalytics,
  type AiAutomationSetting,
  type AiConversation,
  type AiInsight,
  type AiMessage,
} from '@/lib/api/admin/ai-assistant';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

const DEFAULT_PROMPTS = [
  'Summarize today’s retail operations risks.',
  'Which inventory items should we reorder?',
  'Explain the latest demand and labor forecasts.',
  'Find sales drops and suggest promotions.',
  'Identify delivery bottlenecks.',
  'Draft actions for approval.',
];

type AiAssistantPanelProps = {
  conversations: AiConversation[];
  insights: AiInsight[];
  actions: AiAction[];
  settings: AiAutomationSetting[];
  analytics: AiAnalytics | null;
};

export function AiAssistantPanel({
  conversations: initialConversations,
  insights: initialInsights,
  actions: initialActions,
  settings: initialSettings,
  analytics,
}: AiAssistantPanelProps) {
  const api = createBrowserApiClient();
  const { formatCurrency } = useTenantSettings();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0]?.id ?? '');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [insights, setInsights] = useState(initialInsights);
  const [actions, setActions] = useState(initialActions);
  const [settings, setSettings] = useState(initialSettings);
  const [prompt, setPrompt] = useState('');
  const [followUps, setFollowUps] = useState(DEFAULT_PROMPTS.slice(0, 3));
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );
  const pendingActions = actions.filter((action) => action.status === 'pending_approval');

  async function openConversation(conversationId: string) {
    setSelectedConversationId(conversationId);
    setError(null);
    try {
      setMessages(await listAiMessages(api, conversationId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitPrompt(value = prompt) {
    if (!value.trim()) return;
    setIsBusy(true);
    setStatus(null);
    setError(null);
    try {
      const response = await sendAiMessage(api, {
        conversationId: selectedConversationId || undefined,
        message: value.trim(),
      });
      setSelectedConversationId(response.conversation.id);
      setConversations((current) => upsertById(current, response.conversation));
      setMessages((current) => {
        const base = selectedConversationId === response.conversation.id ? current : [];
        return [...base, response.userMessage, response.assistantMessage];
      });
      setActions((current) => mergeById(response.proposedActions, current));
      setFollowUps(response.followUps.length ? response.followUps : response.suggestedPrompts.slice(0, 3));
      setPrompt('');
      setStatus(response.proposedActions.length ? `${response.proposedActions.length} approval action(s) drafted.` : 'Assistant response ready.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshInsights() {
    setStatus(null);
    setError(null);
    try {
      setInsights(await generateAiInsights(api));
      setStatus('AI insights refreshed.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function review(action: AiAction, statusValue: 'approved' | 'rejected') {
    setError(null);
    try {
      const updated = await reviewAiAction(api, action.id, statusValue);
      setActions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setStatus(statusValue === 'approved' ? 'Action approved and executed with audit logging.' : 'Action rejected.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleSetting(setting: AiAutomationSetting, patch: Partial<Pick<AiAutomationSetting, 'isEnabled' | 'requiresApproval'>>) {
    setError(null);
    try {
      const updated = await updateAiAutomationSetting(api, {
        automationType: setting.automationType,
        isEnabled: patch.isEnabled ?? setting.isEnabled,
        requiresApproval: patch.requiresApproval ?? setting.requiresApproval,
        thresholds: setting.thresholds,
      });
      setSettings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <Metric title="AI usage" value={analytics?.usageCount ?? 0} />
        <Metric title="Actions proposed" value={analytics?.automationImpact.actionsProposed ?? pendingActions.length} />
        <Metric title="Open insights" value={analytics?.automationImpact.openInsights ?? insights.length} />
        <Metric title="Estimated savings" value={formatCurrency(((analytics?.costSavingsCents ?? 0) / 100).toFixed(2))} />
      </MetricGrid>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      {error ? <FormErrorAlert message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Retail Operations Copilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[0.75fr_1.25fr]">
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full justify-start" onClick={() => {
                  setSelectedConversationId('');
                  setMessages([]);
                  setPrompt('');
                }}>
                  New conversation
                </Button>
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`w-full rounded-md border p-3 text-left text-sm ${conversation.id === selectedConversationId ? 'border-primary bg-muted' : 'hover:bg-muted'}`}
                    onClick={() => void openConversation(conversation.id)}
                  >
                    <span className="block font-medium">{conversation.title}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(conversation.updatedAt)}</span>
                  </button>
                ))}
                {!conversations.length ? <p className="text-sm text-muted-foreground">Ask a question to start your first assistant thread.</p> : null}
              </div>

              <div className="space-y-4">
                <div className="min-h-80 space-y-3 rounded-md border p-4">
                  {selectedConversation ? <p className="text-xs text-muted-foreground">Conversation: {selectedConversation.title}</p> : null}
                  {messages.length ? messages.map((message) => (
                    <div key={message.id} className={`rounded-lg border p-3 text-sm ${message.role === 'user' ? 'ml-8 bg-muted' : 'mr-8'}`}>
                      <p className="text-xs font-medium uppercase text-muted-foreground">{message.role}</p>
                      <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Ask about sales, inventory, customers, staffing, delivery, forecasts, support, or recommended actions.</p>
                      <PromptButtons prompts={DEFAULT_PROMPTS} onSelect={(value) => void submitPrompt(value)} />
                    </div>
                  )}
                </div>
                {followUps.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Follow-up questions</p>
                    <PromptButtons prompts={followUps} onSelect={(value) => void submitPrompt(value)} />
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 md:flex-row">
                  <Input
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void submitPrompt();
                    }}
                    placeholder="Ask: Explain demand forecast and draft low-stock actions"
                  />
                  <Button type="button" onClick={() => void submitPrompt()} disabled={isBusy || !prompt.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void submitPrompt('Summarize today’s retail operations risks and anomalies.')}>
              Summarize risks
            </Button>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void submitPrompt('Find low-stock items and generate reorder suggestions for approval.')}>
              Draft reorder suggestions
            </Button>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void submitPrompt('Explain demand, labor, and replenishment forecasts.')}>
              Explain forecasts
            </Button>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void submitPrompt('Create promotion, loyalty, and marketing journey ideas for approval.')}>
              Suggest campaigns
            </Button>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => void refreshInsights()}>
              Refresh insights
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 8).map((insight) => (
              <div key={insight.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{insight.title}</p>
                  <Tag variant={severityVariant(insight.severity)}><TagLabel>{insight.severity}</TagLabel></Tag>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{insight.summary}</p>
                {insight.recommendedAction ? <p className="mt-2 text-sm">Recommended: {insight.recommendedAction}</p> : null}
              </div>
            ))}
            {!insights.length ? <PanelEmpty title="No open insights yet" description="Content will appear here when available." /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {actions.slice(0, 10).map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <p className="font-medium">{label(action.actionType)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(action.createdAt)}</p>
                    </TableCell>
                    <TableCell><Tag variant={severityVariant(action.riskLevel)}><TagLabel>{action.riskLevel}</TagLabel></Tag></TableCell>
                    <TableCell>{action.status}</TableCell>
                    <TableCell>
                      {action.status === 'pending_approval' ? (
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={() => void review(action, 'approved')}>Approve</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => void review(action, 'rejected')}>Reject</Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{action.executedAt ? formatDate(action.executedAt) : 'Reviewed'}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!actions.length ? <p className="mt-3 text-sm text-muted-foreground">Assistant actions will appear here before execution.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Automation</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Human approval</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{label(setting.automationType)}</TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={setting.isEnabled} onChange={(event) => void toggleSetting(setting, { isEnabled: event.target.checked })} />
                      {setting.isEnabled ? 'Enabled' : 'Disabled'}
                    </label>
                  </TableCell>
                  <TableCell>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={setting.requiresApproval} onChange={(event) => void toggleSetting(setting, { requiresApproval: event.target.checked })} />
                      Required
                    </label>
                  </TableCell>
                  <TableCell>{formatDate(setting.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}

function PromptButtons({ prompts, onSelect }: { prompts: string[]; onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <Button key={prompt} type="button" size="sm" variant="outline" onClick={() => onSelect(prompt)}>
          {prompt}
        </Button>
      ))}
    </div>
  );
}


function mergeById<T extends { id: string }>(incoming: T[], current: T[]) {
  const seen = new Set(incoming.map((item) => item.id));
  return [...incoming, ...current.filter((item) => !seen.has(item.id))];
}

function upsertById<T extends { id: string }>(current: T[], item: T) {
  return current.some((existing) => existing.id === item.id)
    ? current.map((existing) => (existing.id === item.id ? item : existing))
    : [item, ...current];
}

function label(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ');
}

function severityVariant(severity: string) {
  if (severity === 'critical' || severity === 'high') return 'destructive';
  if (severity === 'medium') return 'secondary';
  return 'outline';
}
