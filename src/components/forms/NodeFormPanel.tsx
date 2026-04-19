import React, { useEffect, useState } from 'react';
import {
  X, Plus, Trash2, Play, ClipboardList, ShieldCheck,
  Zap, Flag, ChevronDown
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { getAutomations } from '../../api/mockApi';
import type {
  StartNodeData, TaskNodeData, ApprovalNodeData,
  AutomatedStepNodeData, EndNodeData, AutomationAction, KVPair,
} from '../../types/workflow';
import { nanoid } from '../../api/nanoid';

// ─── Shared UI helpers ────────────────────────────────────────────

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function KVList({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: {
  pairs: KVPair[];
  onChange: (pairs: KVPair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const add = () => onChange([...pairs, { id: nanoid(), key: '', value: '' }]);
  const remove = (id: string) => onChange(pairs.filter((p) => p.id !== id));
  const update = (id: string, field: 'key' | 'value', val: string) =>
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)));

  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <div key={pair.id} className="flex gap-2 items-center">
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={(e) => update(pair.id, 'key', e.target.value)}
          />
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={(e) => update(pair.id, 'value', e.target.value)}
          />
          <button
            onClick={() => remove(pair.id)}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: '#fee2e2', color: '#dc2626' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
      >
        <Plus size={12} /> Add Field
      </button>
    </div>
  );
}

// ─── Start Node Form ──────────────────────────────────────────────

function StartNodeForm({ id, data }: { id: string; data: StartNodeData }) {
  const update = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div className="space-y-1">
      <FormGroup label="Workflow Title">
        <input
          className="form-input"
          placeholder="e.g. Employee Onboarding"
          value={data.title}
          onChange={(e) => update(id, { title: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Metadata">
        <KVList
          pairs={data.metadata}
          onChange={(metadata) => update(id, { metadata })}
          keyPlaceholder="key"
          valuePlaceholder="value"
        />
      </FormGroup>
    </div>
  );
}

// ─── Task Node Form ───────────────────────────────────────────────

function TaskNodeForm({ id, data }: { id: string; data: TaskNodeData }) {
  const update = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div className="space-y-1">
      <FormGroup label="Title *">
        <input
          className="form-input"
          placeholder="Task title"
          value={data.title}
          onChange={(e) => update(id, { title: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Description">
        <textarea
          className="form-input"
          style={{ resize: 'vertical', minHeight: 64 }}
          placeholder="What needs to be done?"
          value={data.description}
          onChange={(e) => update(id, { description: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Assignee">
        <input
          className="form-input"
          placeholder="e.g. HR Team, John Doe"
          value={data.assignee}
          onChange={(e) => update(id, { assignee: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Due Date">
        <input
          type="date"
          className="form-input"
          value={data.dueDate}
          onChange={(e) => update(id, { dueDate: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Custom Fields">
        <KVList
          pairs={data.customFields}
          onChange={(customFields) => update(id, { customFields })}
        />
      </FormGroup>
    </div>
  );
}

// ─── Approval Node Form ───────────────────────────────────────────

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite', 'Legal'];

function ApprovalNodeForm({ id, data }: { id: string; data: ApprovalNodeData }) {
  const update = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div className="space-y-1">
      <FormGroup label="Title">
        <input
          className="form-input"
          placeholder="Approval step title"
          value={data.title}
          onChange={(e) => update(id, { title: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Approver Role">
        <div className="relative">
          <select
            className="form-input appearance-none pr-8"
            value={data.approverRole}
            onChange={(e) => update(id, { approverRole: e.target.value })}
          >
            {APPROVER_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
      </FormGroup>
      <FormGroup label="Auto-Approve Threshold">
        <input
          type="number"
          className="form-input"
          min={0}
          placeholder="0 = manual approval"
          value={data.autoApproveThreshold}
          onChange={(e) => update(id, { autoApproveThreshold: Number(e.target.value) })}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Set &gt; 0 to auto-approve if score exceeds threshold
        </p>
      </FormGroup>
    </div>
  );
}

// ─── Automated Step Node Form ─────────────────────────────────────

function AutomatedStepNodeForm({ id, data }: { id: string; data: AutomatedStepNodeData }) {
  const update = useWorkflowStore((s) => s.updateNodeData);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAutomations().then((a) => { setActions(a); setLoading(false); });
  }, []);

  const selectedAction = actions.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    const actionParams: Record<string, string> = {};
    if (action) {
      action.params.forEach((p) => { actionParams[p] = data.actionParams?.[p] ?? ''; });
    }
    update(id, { actionId, actionParams });
  };

  const updateParam = (key: string, value: string) => {
    update(id, { actionParams: { ...data.actionParams, [key]: value } });
  };

  return (
    <div className="space-y-1">
      <FormGroup label="Title">
        <input
          className="form-input"
          placeholder="Automated step name"
          value={data.title}
          onChange={(e) => update(id, { title: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Action">
        <div className="relative">
          <select
            className="form-input appearance-none pr-8"
            value={data.actionId}
            onChange={(e) => handleActionChange(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading actions…' : '— Select an action —'}
            </option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
      </FormGroup>

      {/* Dynamic params */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div>
          <p className="form-label mb-2">Action Parameters</p>
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--auto-bg)', border: '1px solid var(--auto-border)' }}>
            {selectedAction.params.map((param) => (
              <div key={param}>
                <label className="text-xs font-medium mb-1 block capitalize" style={{ color: 'var(--auto-text)' }}>
                  {param}
                </label>
                <input
                  className="form-input"
                  style={{ fontSize: 13 }}
                  placeholder={`Enter ${param}…`}
                  value={data.actionParams?.[param] ?? ''}
                  onChange={(e) => updateParam(param, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── End Node Form ────────────────────────────────────────────────

function EndNodeForm({ id, data }: { id: string; data: EndNodeData }) {
  const update = useWorkflowStore((s) => s.updateNodeData);
  return (
    <div className="space-y-1">
      <FormGroup label="End Message">
        <textarea
          className="form-input"
          style={{ resize: 'vertical', minHeight: 72 }}
          placeholder="Workflow complete message"
          value={data.endMessage}
          onChange={(e) => update(id, { endMessage: e.target.value })}
        />
      </FormGroup>
      <FormGroup label="Generate Summary Report">
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all"
          style={{
            background: data.summaryFlag ? 'var(--end-bg)' : 'var(--surface-2)',
            border: `1.5px solid ${data.summaryFlag ? 'var(--end-border)' : 'var(--border)'}`,
          }}
          onClick={() => update(id, { summaryFlag: !data.summaryFlag })}
        >
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Summary flag
          </span>
          <div
            className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
            style={{ background: data.summaryFlag ? 'var(--end-icon)' : '#d1d5db' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
              style={{ left: data.summaryFlag ? '22px' : '2px' }}
            />
          </div>
        </div>
      </FormGroup>
    </div>
  );
}

// ─── Node Form Panel (Container) ──────────────────────────────────

const NODE_META: Record<string, { label: string; bgColor: string; iconColor: string; textColor: string; icon: React.ReactNode }> = {
  start:     { label: 'Start Node',         bgColor: 'var(--start-bg)',    iconColor: 'var(--start-icon)',    textColor: 'var(--start-text)',    icon: <Play    size={14} fill="currentColor" /> },
  task:      { label: 'Task Node',           bgColor: 'var(--task-bg)',     iconColor: 'var(--task-icon)',     textColor: 'var(--task-text)',     icon: <ClipboardList size={14} /> },
  approval:  { label: 'Approval Node',       bgColor: 'var(--approval-bg)', iconColor: 'var(--approval-icon)', textColor: 'var(--approval-text)', icon: <ShieldCheck   size={14} /> },
  automated: { label: 'Automated Step',      bgColor: 'var(--auto-bg)',     iconColor: 'var(--auto-icon)',     textColor: 'var(--auto-text)',     icon: <Zap           size={14} /> },
  end:       { label: 'End Node',            bgColor: 'var(--end-bg)',      iconColor: 'var(--end-icon)',      textColor: 'var(--end-text)',      icon: <Flag          size={14} /> },
};

export function NodeFormPanel() {
  const { nodes, selectedNodeId, setSelectedNode } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside
        className="h-full flex flex-col items-center justify-center text-center"
        style={{ width: 300, background: 'white', borderLeft: '1.5px solid var(--border)', flexShrink: 0 }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
          No node selected
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Click a node to edit its properties
        </p>
      </aside>
    );
  }

  const nodeType = selectedNode.type as string;
  const meta = NODE_META[nodeType];

  return (
    <aside
      className="h-full flex flex-col slide-in-right"
      style={{ width: 300, background: 'white', borderLeft: '1.5px solid var(--border)', flexShrink: 0 }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--border)', background: meta.bgColor }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'white', color: meta.iconColor }}
          >
            {meta.icon}
          </span>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: meta.textColor, fontFamily: 'Outfit, sans-serif' }}
            >
              {meta.label}
            </p>
            <p className="text-xs" style={{ color: meta.iconColor, opacity: 0.7 }}>
              ID: {selectedNode.id.slice(0, 12)}…
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(0,0,0,0.06)', color: meta.textColor }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-4">
        {nodeType === 'start'     && <StartNodeForm     id={selectedNode.id} data={selectedNode.data as StartNodeData} />}
        {nodeType === 'task'      && <TaskNodeForm      id={selectedNode.id} data={selectedNode.data as TaskNodeData} />}
        {nodeType === 'approval'  && <ApprovalNodeForm  id={selectedNode.id} data={selectedNode.data as ApprovalNodeData} />}
        {nodeType === 'automated' && <AutomatedStepNodeForm id={selectedNode.id} data={selectedNode.data as AutomatedStepNodeData} />}
        {nodeType === 'end'       && <EndNodeForm       id={selectedNode.id} data={selectedNode.data as EndNodeData} />}
      </div>
    </aside>
  );
}
