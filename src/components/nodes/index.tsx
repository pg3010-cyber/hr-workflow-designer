import React from 'react';
import type { NodeProps } from '@xyflow/react';
import {
  Play, ClipboardList, ShieldCheck, Zap, Flag,
  User, Calendar, ChevronRight, Settings
} from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import type {
  StartNodeType,
  TaskNodeType,
  ApprovalNodeType,
  AutomatedStepNodeType,
  EndNodeType,
} from '../../types/workflow';

// ─── Start Node ───────────────────────────────────────────────────

export function StartNode({ id, data, selected }: NodeProps<StartNodeType>) {
  return (
    <NodeWrapper
      id={id}
      selected={selected}
      nodeType="start"
      label="Start"
      bgColor="var(--start-bg)"
      borderColor="var(--start-border)"
      iconColor="var(--start-icon)"
      textColor="var(--start-text)"
      icon={<Play size={12} fill="currentColor" />}
      hasTopHandle={false}
    >
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
        {data.title || 'Untitled Start'}
      </p>
      {data.metadata && data.metadata.length > 0 && (
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {data.metadata.length} metadata field{data.metadata.length !== 1 ? 's' : ''}
        </p>
      )}
    </NodeWrapper>
  );
}

// ─── Task Node ────────────────────────────────────────────────────

export function TaskNode({ id, data, selected }: NodeProps<TaskNodeType>) {
  return (
    <NodeWrapper
      id={id}
      selected={selected}
      nodeType="task"
      label="Task"
      bgColor="var(--task-bg)"
      borderColor="var(--task-border)"
      iconColor="var(--task-icon)"
      textColor="var(--task-text)"
      icon={<ClipboardList size={12} />}
    >
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
        {data.title || 'Untitled Task'}
      </p>
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {data.assignee && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <User size={10} />
            <span className="truncate max-w-[80px]">{data.assignee}</span>
          </span>
        )}
        {data.dueDate && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={10} />
            {data.dueDate}
          </span>
        )}
      </div>
    </NodeWrapper>
  );
}

// ─── Approval Node ────────────────────────────────────────────────

export function ApprovalNode({ id, data, selected }: NodeProps<ApprovalNodeType>) {
  return (
    <NodeWrapper
      id={id}
      selected={selected}
      nodeType="approval"
      label="Approval"
      bgColor="var(--approval-bg)"
      borderColor="var(--approval-border)"
      iconColor="var(--approval-icon)"
      textColor="var(--approval-text)"
      icon={<ShieldCheck size={12} />}
    >
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
        {data.title || 'Approval Step'}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--approval-bg)', color: 'var(--approval-text)', border: '1px solid var(--approval-border)' }}
        >
          {data.approverRole || 'Manager'}
        </span>
        {data.autoApproveThreshold > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Auto ≥{data.autoApproveThreshold}
          </span>
        )}
      </div>
    </NodeWrapper>
  );
}

// ─── Automated Step Node ──────────────────────────────────────────

export function AutomatedStepNode({ id, data, selected }: NodeProps<AutomatedStepNodeType>) {
  return (
    <NodeWrapper
      id={id}
      selected={selected}
      nodeType="automated"
      label="Automated"
      bgColor="var(--auto-bg)"
      borderColor="var(--auto-border)"
      iconColor="var(--auto-icon)"
      textColor="var(--auto-text)"
      icon={<Zap size={12} />}
    >
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
        {data.title || 'Automated Step'}
      </p>
      {data.actionId && (
        <div className="flex items-center gap-1 mt-1">
          <Settings size={10} style={{ color: 'var(--auto-icon)' }} />
          <span className="text-xs truncate" style={{ color: 'var(--auto-icon)', fontWeight: 500 }}>
            {data.actionId.replace('_', ' ')}
          </span>
        </div>
      )}
    </NodeWrapper>
  );
}

// ─── End Node ─────────────────────────────────────────────────────

export function EndNode({ id, data, selected }: NodeProps<EndNodeType>) {
  return (
    <NodeWrapper
      id={id}
      selected={selected}
      nodeType="end"
      label="End"
      bgColor="var(--end-bg)"
      borderColor="var(--end-border)"
      iconColor="var(--end-icon)"
      textColor="var(--end-text)"
      icon={<Flag size={12} />}
      hasBottomHandle={false}
    >
      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
        {data.endMessage || 'Workflow Complete'}
      </p>
      {data.summaryFlag && (
        <span
          className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--end-bg)', color: 'var(--end-text)', border: '1px solid var(--end-border)' }}
        >
          📄 Summary
        </span>
      )}
    </NodeWrapper>
  );
}

// ─── Node Types Map ───────────────────────────────────────────────

export const NODE_TYPES = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedStepNode,
  end:       EndNode,
};
