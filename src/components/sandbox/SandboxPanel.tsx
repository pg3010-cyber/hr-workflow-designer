import React, { useCallback } from 'react';
import {
  X, Play, CheckCircle2, Clock, AlertCircle,
  SkipForward, Loader2, ChevronRight, Timer,
  AlertTriangle,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { postSimulate } from '../../api/mockApi';
import { validateWorkflow } from '../../utils/validation';
import type { SimulationStep, StepStatus, WorkflowNodeType } from '../../types/workflow';

// ─── Step status styling ──────────────────────────────────────────

const STATUS_CONFIG: Record<StepStatus, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  completed: {
    icon: <CheckCircle2 size={15} />,
    color: '#16a34a',
    bg: '#dcfce7',
    label: 'Completed',
  },
  pending: {
    icon: <Clock size={15} />,
    color: '#d97706',
    bg: '#fef9c3',
    label: 'Pending',
  },
  failed: {
    icon: <AlertCircle size={15} />,
    color: '#dc2626',
    bg: '#fee2e2',
    label: 'Failed',
  },
  skipped: {
    icon: <SkipForward size={15} />,
    color: '#6b7280',
    bg: '#f3f4f6',
    label: 'Skipped',
  },
};

const NODE_TYPE_COLORS: Record<WorkflowNodeType, string> = {
  start:     '#16a34a',
  task:      '#1d4ed8',
  approval:  '#b45309',
  automated: '#7c3aed',
  end:       '#be185d',
};

const NODE_TYPE_LABELS: Record<WorkflowNodeType, string> = {
  start:     'Start',
  task:      'Task',
  approval:  'Approval',
  automated: 'Automated',
  end:       'End',
};

function StepCard({ step, index }: { step: SimulationStep; index: number }) {
  const sc = STATUS_CONFIG[step.status];
  const nodeColor = NODE_TYPE_COLORS[step.nodeType] ?? '#7c3aed';
  const ts = new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      className="flex gap-3 fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
          style={{ background: sc.bg, color: sc.color, fontFamily: 'Outfit, sans-serif' }}
        >
          {index + 1}
        </div>
        {/* Connector line — rendered by parent */}
      </div>

      {/* Card */}
      <div
        className="flex-1 mb-3 rounded-2xl p-3 transition-all"
        style={{
          background: 'white',
          border: `1.5px solid ${sc.bg === '#f3f4f6' ? 'var(--border)' : sc.bg}`,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                style={{ background: nodeColor + '18', color: nodeColor, fontFamily: 'Outfit, sans-serif' }}
              >
                {NODE_TYPE_LABELS[step.nodeType]}
              </span>
              <span
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: sc.color }}
              >
                {sc.icon} {sc.label}
              </span>
            </div>
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
              {step.title}
            </p>
          </div>
          <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {ts}
          </span>
        </div>

        {/* Message */}
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          {step.message}
        </p>

        {/* Details */}
        {step.details && (
          <p
            className="text-xs mt-1 px-2 py-1 rounded-lg"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', fontFamily: 'monospace' }}
          >
            {step.details}
          </p>
        )}
      </div>
    </div>
  );
}

export function SandboxPanel() {
  const {
    simulationOpen, simulationResult, simulationLoading,
    setSimulationOpen, setSimulationResult, setSimulationLoading,
    setSimulationStatusMap,
    nodes, edges,
  } = useWorkflowStore();

  const runSimulation = useCallback(async () => {
    setSimulationLoading(true);
    setSimulationResult(null);
    setSimulationStatusMap({});
    try {
      const result = await postSimulate(nodes as any, edges as any);
      setSimulationResult(result);
      const statusMap: Record<string, import('../../types/workflow').StepStatus> = {};
      result.steps.forEach((step: any) => { statusMap[step.nodeId] = step.status; });
      setSimulationStatusMap(statusMap);
    } finally {
      setSimulationLoading(false);
    }
  }, [nodes, edges, setSimulationLoading, setSimulationResult, setSimulationStatusMap]);

  if (!simulationOpen) return null;

  // Pre-flight validation
  const validationErrors = validateWorkflow(nodes as any, edges);

  const completedCount = simulationResult?.steps.filter((s) => s.status === 'completed').length ?? 0;
  const pendingCount   = simulationResult?.steps.filter((s) => s.status === 'pending').length ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(28,21,53,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSimulationOpen(false)}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col slide-in-right"
        style={{
          width: 460,
          background: 'white',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: '1.5px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--accent-light)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Play size={16} fill="white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}>
                Workflow Sandbox
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {nodes.length} nodes · {edges.length} edges
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulationOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--accent)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Pre-flight validation warnings */}
        {validationErrors.length > 0 && (
          <div className="mx-4 mt-4 rounded-xl p-3 flex-shrink-0" style={{ background: '#fef9c3', border: '1px solid #fde047' }}>
            <p className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#78350f' }}>
              <AlertTriangle size={13} /> Validation Issues
            </p>
            {validationErrors.map((e, i) => (
              <p key={i} className="text-xs" style={{ color: '#92400e' }}>
                • {e.message}
              </p>
            ))}
          </div>
        )}

        {/* Run button */}
        <div className="px-4 pt-4 flex-shrink-0">
          <button
            onClick={runSimulation}
            disabled={simulationLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-semibold text-sm transition-all"
            style={{
              background: simulationLoading ? 'var(--border)' : 'var(--accent)',
              color: simulationLoading ? 'var(--text-muted)' : 'white',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: simulationLoading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            {simulationLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Simulating…
              </>
            ) : (
              <>
                <Play size={16} fill="white" /> Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {simulationLoading && (
            <div className="flex flex-col items-center justify-center h-48 fade-in">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                <Loader2 size={24} className="animate-spin" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                Executing workflow…
              </p>
            </div>
          )}

          {simulationResult && !simulationLoading && (
            <div className="mt-4 fade-in">
              {/* Summary bar */}
              <div
                className="rounded-2xl p-4 mb-4 flex items-center gap-4"
                style={{
                  background: simulationResult.success ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${simulationResult.success ? '#86efac' : '#fca5a5'}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: simulationResult.success ? '#16a34a' : '#dc2626',
                    color: 'white',
                  }}
                >
                  {simulationResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <p
                    className="font-bold text-sm"
                    style={{ color: simulationResult.success ? '#14532d' : '#7f1d1d', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {simulationResult.success ? 'Simulation Passed' : 'Simulation Failed'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: simulationResult.success ? '#16a34a' : '#dc2626' }}>
                    {simulationResult.steps.length} steps · {completedCount} completed · {pendingCount} pending · {simulationResult.duration}ms
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: simulationResult.success ? '#16a34a' : '#dc2626' }}>
                  <Timer size={14} />
                  <span className="text-xs font-mono">{simulationResult.duration}ms</span>
                </div>
              </div>

              {/* Errors */}
              {simulationResult.errors.length > 0 && (
                <div className="rounded-2xl p-3 mb-4" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                  {simulationResult.errors.map((e, i) => (
                    <p key={i} className="text-xs" style={{ color: '#7f1d1d' }}>
                      ✕ {e}
                    </p>
                  ))}
                </div>
              )}

              {/* Step cards */}
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}
              >
                Execution Log
              </p>
              <div>
                {simulationResult.steps.map((step, i) => (
                  <StepCard key={step.nodeId} step={step} index={i} />
                ))}
              </div>
            </div>
          )}

          {!simulationResult && !simulationLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                <ChevronRight size={24} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
                Press "Run Simulation" to test your workflow
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
