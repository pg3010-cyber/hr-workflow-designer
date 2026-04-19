import type {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowNode,
  WorkflowEdge,
  AutomatedStepNodeData,
  WorkflowNodeType,
} from '../types/workflow';

// ─── Mock Data ────────────────────────────────────────────────────

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email',     label: 'Send Email',           params: ['to', 'subject', 'body'] },
  { id: 'generate_doc',   label: 'Generate Document',    params: ['template', 'recipient'] },
  { id: 'notify_slack',   label: 'Notify via Slack',     params: ['channel', 'message'] },
  { id: 'create_ticket',  label: 'Create JIRA Ticket',   params: ['project', 'summary'] },
  { id: 'update_hris',    label: 'Update HRIS Record',   params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meet',  label: 'Schedule Meeting',     params: ['attendees', 'title', 'duration'] },
  { id: 'trigger_bg',     label: 'Trigger Background Check', params: ['candidateId', 'type'] },
  { id: 'provision_acc',  label: 'Provision Accounts',   params: ['userId', 'systems'] },
];

// ─── Helper ───────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getNodeTitle(node: WorkflowNode): string {
  const d = node.data as Record<string, unknown>;
  return (d.title as string) || (d.endMessage as string) || node.type || 'Unnamed';
}

function getActionLabel(actionId: string): string {
  return MOCK_AUTOMATIONS.find((a) => a.id === actionId)?.label ?? actionId;
}

function buildAdjacency(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const n of nodes) map.set(n.id, []);
  for (const e of edges) {
    const list = map.get(e.source);
    if (list) list.push(e.target);
  }
  return map;
}

// Topological sort using Kahn's algorithm
function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): { order: string[]; hasCycle: boolean } {
  const inDegree = new Map<string, number>();
  for (const n of nodes) inDegree.set(n.id, 0);
  for (const e of edges) {
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }
  const adj = buildAdjacency(nodes, edges);
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const order: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    order.push(curr);
    for (const neighbor of adj.get(curr) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }
  return { order, hasCycle: order.length !== nodes.length };
}

// ─── API Functions ────────────────────────────────────────────────

/** GET /automations */
export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(250);
  return MOCK_AUTOMATIONS;
}

/** POST /simulate */
export async function postSimulate(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<SimulationResult> {
  await delay(900);

  const errors: string[] = [];
  const steps: SimulationStep[] = [];
  const t0 = Date.now();

  // ── Structural validation ──
  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes   = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) errors.push('Workflow must have at least one Start node.');
  if (startNodes.length > 1)  errors.push('Workflow must have exactly one Start node.');
  if (endNodes.length === 0)  errors.push('Workflow must have at least one End node.');

  // ── Connectivity check ──
  const connectedIds = new Set<string>();
  edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target); });
  const isolated = nodes.filter(
    (n) => !connectedIds.has(n.id) && n.type !== 'start' && n.type !== 'end'
  );
  isolated.forEach((n) =>
    errors.push(`Node "${getNodeTitle(n)}" is not connected to any edge.`)
  );

  // ── Cycle detection ──
  const { order, hasCycle } = topologicalSort(nodes, edges);
  if (hasCycle) errors.push('Workflow contains a cycle — execution would loop forever.');

  if (errors.length > 0) {
    return { success: false, steps: [], errors, duration: Date.now() - t0 };
  }

  // ── Simulate execution in topological order ──
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const now = new Date();

  order.forEach((id, idx) => {
    const node = nodeMap.get(id);
    if (!node) return;

    const ts = new Date(now.getTime() + idx * 1200).toISOString();
    const type = node.type as WorkflowNodeType;

    let status: SimulationStep['status'] = 'completed';
    let message = '';
    let details: string | undefined;

    switch (type) {
      case 'start': {
        const d = node.data as { title?: string };
        message = `Workflow initiated: "${d.title || 'Untitled'}"`;
        break;
      }
      case 'task': {
        const d = node.data as { title?: string; assignee?: string; dueDate?: string };
        message = `Task assigned to ${d.assignee || 'Unassigned'}`;
        details = d.dueDate ? `Due: ${d.dueDate}` : undefined;
        break;
      }
      case 'approval': {
        const d = node.data as { title?: string; approverRole?: string; autoApproveThreshold?: number };
        const threshold = d.autoApproveThreshold ?? 0;
        if (threshold > 0) {
          message = `Auto-approved (threshold: ${threshold})`;
        } else {
          message = `Approval pending from ${d.approverRole || 'Manager'}`;
          status = 'pending';
        }
        break;
      }
      case 'automated': {
        const d = node.data as AutomatedStepNodeData;
        const actionLabel = getActionLabel(d.actionId);
        message = `Executed: ${actionLabel}`;
        const paramStr = Object.entries(d.actionParams ?? {})
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}="${v}"`)
          .join(', ');
        details = paramStr || undefined;
        break;
      }
      case 'end': {
        const d = node.data as { endMessage?: string; summaryFlag?: boolean };
        message = d.endMessage || 'Workflow completed.';
        details = d.summaryFlag ? 'Summary report generated.' : undefined;
        break;
      }
    }

    steps.push({
      nodeId: id,
      nodeType: type,
      title: getNodeTitle(node),
      status,
      message,
      details,
      timestamp: ts,
    });
  });

  const hasPending = steps.some((s) => s.status === 'pending');

  return {
    success: true,
    steps,
    errors: [],
    duration: Date.now() - t0,
  };
}
