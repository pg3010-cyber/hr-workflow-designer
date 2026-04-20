import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  NodeChange,
  EdgeChange,
  Connection,
  MarkerType,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  SimulationResult,
  StepStatus,
  StartNodeData,
} from '../types/workflow';
import { nanoid } from '../api/nanoid';

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-start', type: 'start', position: { x: 320, y: 60 },
    data: { title: 'Employee Onboarding', metadata: [{ id: 'meta-1', key: 'department', value: 'Engineering' }] } as StartNodeData,
  },
  {
    id: 'node-task-1', type: 'task', position: { x: 220, y: 200 },
    data: { title: 'Collect Documents', description: 'Gather ID proof, address proof, and educational certificates.', assignee: 'HR Team', dueDate: '2025-02-01', customFields: [] },
  },
  {
    id: 'node-approval-1', type: 'approval', position: { x: 420, y: 200 },
    data: { title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
  },
  {
    id: 'node-auto-1', type: 'automated', position: { x: 320, y: 360 },
    data: { title: 'Provision Accounts', actionId: 'provision_acc', actionParams: { userId: '', systems: 'GitHub, Slack, Jira' } },
  },
  {
    id: 'node-end', type: 'end', position: { x: 320, y: 510 },
    data: { endMessage: 'Onboarding complete! Welcome aboard. 🎉', summaryFlag: true },
  },
];

const EDGE_DEFAULTS = {
  animated: true,
  style: { stroke: '#c4b5fd', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' },
};

const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'e1', source: 'node-start', target: 'node-task-1', ...EDGE_DEFAULTS },
  { id: 'e2', source: 'node-start', target: 'node-approval-1', ...EDGE_DEFAULTS },
  { id: 'e3', source: 'node-task-1', target: 'node-auto-1', ...EDGE_DEFAULTS },
  { id: 'e4', source: 'node-approval-1', target: 'node-auto-1', ...EDGE_DEFAULTS },
  { id: 'e5', source: 'node-auto-1', target: 'node-end', ...EDGE_DEFAULTS },
];

interface Snapshot { nodes: WorkflowNode[]; edges: WorkflowEdge[]; }
const MAX_HISTORY = 50;

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  workflowName: string;
  past: Snapshot[];
  future: Snapshot[];
  simulationResult: SimulationResult | null;
  simulationOpen: boolean;
  simulationLoading: boolean;
  simulationStatusMap: Record<string, StepStatus>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (id: string | null) => void;
  addWorkflowNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setSimulationResult: (r: SimulationResult | null) => void;
  setSimulationOpen: (open: boolean) => void;
  setSimulationLoading: (loading: boolean) => void;
  setSimulationStatusMap: (map: Record<string, StepStatus>) => void;
  clearWorkflow: () => void;
  setWorkflowName: (name: string) => void;
  loadTemplate: (nodes: WorkflowNode[], edges: WorkflowEdge[], name: string) => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
}

function getDefaultData(type: string): WorkflowNode['data'] {
  switch (type) {
    case 'start': return { title: 'Start', metadata: [] } as import('../types/workflow').StartNodeData;
    case 'task': return { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] } as import('../types/workflow').TaskNodeData;
    case 'approval': return { title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 } as import('../types/workflow').ApprovalNodeData;
    case 'automated': return { title: 'Automated Step', actionId: '', actionParams: {} } as import('../types/workflow').AutomatedStepNodeData;
    case 'end': default: return { endMessage: 'Workflow complete.', summaryFlag: false } as import('../types/workflow').EndNodeData;
  }
}

function snap(nodes: WorkflowNode[], edges: WorkflowEdge[]): Snapshot {
  return { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
}

function pushHistory(past: Snapshot[], nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  return [...past.slice(-MAX_HISTORY + 1), snap(nodes, edges)];
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: INITIAL_NODES as WorkflowNode[],
  edges: INITIAL_EDGES,
  selectedNodeId: null,
  workflowName: 'Employee Onboarding',
  past: [],
  future: [],
  simulationResult: null,
  simulationOpen: false,
  simulationLoading: false,
  simulationStatusMap: {},

  onNodesChange: (changes) => {
    const sig = changes.some(c => c.type === 'add' || c.type === 'remove');
    if (sig) {
      const { nodes, edges, past } = get();
      set({ past: pushHistory(past, nodes, edges), future: [] });
    }
    set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] });
  },

  onEdgesChange: (changes) => {
    const sig = changes.some(c => c.type === 'add' || c.type === 'remove');
    if (sig) {
      const { nodes, edges, past } = get();
      set({ past: pushHistory(past, nodes, edges), future: [] });
    }
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const { nodes, edges, past } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newEdge = { ...connection, id: `e-${nanoid()}`, animated: true, style: { stroke: '#c4b5fd', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' } };
    set({ edges: addEdge(newEdge, get().edges as any[]) as WorkflowEdge[] });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addWorkflowNode: (type, position) => {
    const { nodes, edges, past } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const id = `node-${nanoid()}`;
    const newNode = { id, type, position, data: getDefaultData(type) } as WorkflowNode;
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
  },

  updateNodeData: (id, data) => {
    const { nodes, edges, past } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    set({ nodes: get().nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n) as WorkflowNode[] });
  },

  deleteNode: (id) => {
    const { nodes, edges, past } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  duplicateNode: (id) => {
    const { nodes, edges, past } = get();
    const original = nodes.find((n) => n.id === id);
    if (!original) return;
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newId = `node-${nanoid()}`;
    const copy = { ...original, id: newId, position: { x: original.position.x + 50, y: original.position.y + 70 }, data: JSON.parse(JSON.stringify(original.data)) } as WorkflowNode;
    set({ nodes: [...get().nodes, copy], selectedNodeId: newId });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({ past: past.slice(0, -1), future: [snap(nodes, edges), ...future.slice(0, MAX_HISTORY - 1)], nodes: prev.nodes, edges: prev.edges, selectedNodeId: null });
  },

  redo: () => {
    const { past, nodes, edges, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({ future: future.slice(1), past: pushHistory(past, nodes, edges), nodes: next.nodes, edges: next.edges, selectedNodeId: null });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setSimulationResult: (r) => set({ simulationResult: r }),
  setSimulationOpen: (open) => set({ simulationOpen: open }),
  setSimulationLoading: (loading) => set({ simulationLoading: loading }),
  setSimulationStatusMap: (map) => set({ simulationStatusMap: map }),

  clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null, simulationResult: null, simulationStatusMap: {}, past: [], future: [] }),

  setWorkflowName: (name) => set({ workflowName: name }),

  loadTemplate: (nodes, edges, name) => set({ nodes, edges, workflowName: name, selectedNodeId: null, simulationResult: null, simulationStatusMap: {}, past: [], future: [] }),

  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    return JSON.stringify({ workflowName, nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const parsed = JSON.parse(json);
      set({ nodes: parsed.nodes ?? [], edges: parsed.edges ?? [], workflowName: parsed.workflowName ?? 'Imported Workflow', selectedNodeId: null, past: [], future: [] });
    } catch { console.error('Invalid workflow JSON'); }
  },
}));
