import type { Node, Edge } from '@xyflow/react';

// ─── Node Data Types ─────────────────────────────────────────────

export interface KVPair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData extends Record<string, unknown> {
  title: string;
  metadata: KVPair[];
}

export interface TaskNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KVPair[];
}

export interface ApprovalNodeData extends Record<string, unknown> {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData extends Record<string, unknown> {
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends Record<string, unknown> {
  endMessage: string;
  summaryFlag: boolean;
}

// ─── Node Types ───────────────────────────────────────────────────

export type WorkflowNodeType =
  | 'start'
  | 'task'
  | 'approval'
  | 'automated'
  | 'end';

export type StartNodeType = Node<StartNodeData, 'start'>;
export type TaskNodeType = Node<TaskNodeData, 'task'>;
export type ApprovalNodeType = Node<ApprovalNodeData, 'approval'>;
export type AutomatedStepNodeType = Node<AutomatedStepNodeData, 'automated'>;
export type EndNodeType = Node<EndNodeData, 'end'>;

export type WorkflowNode =
  | StartNodeType
  | TaskNodeType
  | ApprovalNodeType
  | AutomatedStepNodeType
  | EndNodeType;

export type WorkflowEdge = Edge;

// ─── Mock API Types ───────────────────────────────────────────────

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// ─── Simulation Types ─────────────────────────────────────────────

export type StepStatus = 'completed' | 'skipped' | 'failed' | 'pending';

export interface SimulationStep {
  nodeId: string;
  nodeType: WorkflowNodeType;
  title: string;
  status: StepStatus;
  message: string;
  timestamp: string;
  details?: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  duration: number;
}

// ─── Validation ───────────────────────────────────────────────────

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ─── Node Config (for palette) ────────────────────────────────────

export interface NodeConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
  icon: string;
}
