import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X, Copy, CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { validateWorkflow } from '../../utils/validation';

interface NodeWrapperProps {
  id: string;
  selected?: boolean;
  nodeType: string;
  label: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  hasTopHandle?: boolean;
  hasBottomHandle?: boolean;
}

const STATUS_OVERLAY: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  completed: { icon: <CheckCircle2 size={11} />, bg: '#dcfce7', border: '#16a34a' },
  pending:   { icon: <Clock size={11} />,        bg: '#fef9c3', border: '#d97706' },
  failed:    { icon: <AlertCircle size={11} />,  bg: '#fee2e2', border: '#dc2626' },
  skipped:   { icon: <CheckCircle2 size={11} />, bg: '#f3f4f6', border: '#6b7280' },
};

export function NodeWrapper({
  id, selected, nodeType, label,
  bgColor, borderColor, iconColor, textColor,
  icon, children,
  hasTopHandle = true, hasBottomHandle = true,
}: NodeWrapperProps) {
  const deleteNode    = useWorkflowStore((s) => s.deleteNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const simStatus     = useWorkflowStore((s) => s.simulationStatusMap[id]);
  const nodes         = useWorkflowStore((s) => s.nodes);
  const edges         = useWorkflowStore((s) => s.edges);

  // Check if this node has a validation issue
  const validationErrors = validateWorkflow(nodes as any, edges);
  const hasError   = validationErrors.some(e => e.nodeId === id && e.severity === 'error');
  const hasWarning = validationErrors.some(e => e.nodeId === id && e.severity === 'warning');

  const statusOverlay = simStatus ? STATUS_OVERLAY[simStatus] : null;

  // Determine border: priority: selected > simStatus > validation > default
  let effectiveBorder = borderColor;
  let effectiveShadow = 'var(--shadow-node)';

  if (selected) {
    effectiveBorder = 'var(--accent)';
    effectiveShadow = 'var(--shadow-node-selected)';
  } else if (simStatus === 'completed') {
    effectiveBorder = '#16a34a';
    effectiveShadow = '0 0 0 1.5px #16a34a, 0 4px 16px rgba(22,163,74,0.2)';
  } else if (simStatus === 'pending') {
    effectiveBorder = '#d97706';
    effectiveShadow = '0 0 0 1.5px #d97706, 0 4px 16px rgba(217,119,6,0.2)';
  } else if (simStatus === 'failed') {
    effectiveBorder = '#dc2626';
    effectiveShadow = '0 0 0 1.5px #dc2626, 0 4px 16px rgba(220,38,38,0.2)';
  } else if (hasError) {
    effectiveBorder = '#dc2626';
    effectiveShadow = '0 0 0 2px rgba(220,38,38,0.3), var(--shadow-node)';
  } else if (hasWarning) {
    effectiveBorder = '#d97706';
    effectiveShadow = '0 0 0 2px rgba(217,119,6,0.25), var(--shadow-node)';
  }

  return (
    <div
      className="group relative rounded-2xl overflow-visible transition-all duration-200"
      style={{
        width: 220,
        background: 'white',
        border: `1.5px solid ${effectiveBorder}`,
        boxShadow: effectiveShadow,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* ── Simulation status badge ── */}
      {statusOverlay && (
        <div
          className="absolute -top-2.5 -right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: statusOverlay.bg,
            border: `1.5px solid ${statusOverlay.border}`,
            color: statusOverlay.border,
            fontSize: 10,
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          {statusOverlay.icon}
          <span className="capitalize">{simStatus}</span>
        </div>
      )}

      {/* ── Validation warning badge ── */}
      {!simStatus && (hasError || hasWarning) && (
        <div
          className="absolute -top-2.5 -left-2.5 z-20 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: hasError ? '#fee2e2' : '#fef9c3', border: `1.5px solid ${hasError ? '#dc2626' : '#d97706'}` }}
          title={validationErrors.find(e => e.nodeId === id)?.message}
        >
          <AlertTriangle size={10} color={hasError ? '#dc2626' : '#d97706'} />
        </div>
      )}

      {/* ── Action buttons (visible on hover) ── */}
      <div className="absolute -top-3 right-0 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* Duplicate */}
        <button
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
          title="Duplicate node"
        >
          <Copy size={10} strokeWidth={2.5} />
        </button>
        {/* Delete */}
        <button
          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          title="Delete node"
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: bgColor }}>
        <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'white', color: iconColor }}>
          {icon}
        </span>
        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: textColor, fontFamily: 'Outfit, sans-serif', fontSize: 10 }}>
          {label}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="px-3 py-2.5" style={{ minHeight: 40 }}>
        {children}
      </div>

      {/* ── Handles ── */}
      {hasTopHandle && (
        <Handle type="target" position={Position.Top} style={{ top: -6, background: 'var(--auto-icon)' }} />
      )}
      {hasBottomHandle && (
        <Handle type="source" position={Position.Bottom} style={{ bottom: -6, background: 'var(--auto-icon)' }} />
      )}
    </div>
  );
}
