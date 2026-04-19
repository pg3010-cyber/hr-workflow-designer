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
  StartNodeData,
} from '../types/workflow';
import { nanoid } from '../api/nanoid';

// ─── Initial sample workflow ──────────────────────────────────────

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-start',
    type: 'start',
    position: { x: 320, y: 60 },
    data: {
      title: 'Employee Onboarding',
      metadata: [{ id: 'meta-1', key: 'department', value: 'Engineering' }],
    } as StartNodeData,
  },
  {
    id: 'node-task-1',
    type: 'task',
    position: { x: 220, y: 200 },
    data: {
      title: 'Collect Documents',
      description: 'Gather ID proof, address proof, and educational certificates.',
      assignee: 'HR Team',
      dueDate: '2025-02-01',
      customFields: [],
    },
  },
  {
    id: 'node-approval-1',
    type: 'approval',
    position: { x: 420, y: 200 },
    data: {
      title: 'Manager Approval',
      approverRole: 'Manager',
      autoApproveThreshold: 0,
    },
  },
  {
    id: 'node-auto-1',
    type: 'automated',
    position: { x: 320, y: 360 },
    data: {
      title: 'Provision Accounts',
      actionId: 'provision_acc',
      actionParams: { userId: '', systems: 'GitHub, Slack, Jira' },
    },
  },
  {
    id: 'node-end',
    type: 'end',
    position: { x: 320, y: 510 },
    data: {
      endMessage: 'Onboarding complete! Welcome aboard. 🎉',
      summaryFlag: true,
    },
  },
];

const EDGE_DEFAULTS = {
  animated: true,
  style: { stroke: '#c4b5fd', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' },
};

const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'e1', source: 'node-start',      target: 'node-task-1',    ...EDGE_DEFAULTS },
  { id: 'e2', source: 'node-start',      target: 'node-approval-1',...EDGE_DEFAULTS },
  { id: 'e3', source: 'node-task-1',     target: 'node-auto-1',    ...EDGE_DEFAULTS },
  { id: 'e4', source: 'node-approval-1', target: 'node-auto-1',    ...EDGE_DEFAULTS },
  { id: 'e5', source: 'node-auto-1',     target: 'node-end',       ...EDGE_DEFAULTS },
];

// ─── Store Interface ──────────────────────────────────────────────

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  // Simulation
  simulationResult: SimulationResult | null;
  simulationOpen: boolean;
  simulationLoading: boolean;

  // RF callbacks
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node actions
  setSelectedNode: (id: string | null) => void;
  addWorkflowNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (id: string) => void;

  // Simulation actions
  setSimulationResult: (r: SimulationResult | null) => void;
  setSimulationOpen: (open: boolean) => void;
  setSimulationLoading: (loading: boolean) => void;

  // Workflow actions
  clearWorkflow: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
}

// ─── Default node data per type ───────────────────────────────────

function getDefaultData(type: string): WorkflowNode['data'] {
  switch (type) {
    case 'start':
      return { title: 'Start', metadata: [] } as import('../types/workflow').StartNodeData;
    case 'task':
      return { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] } as import('../types/workflow').TaskNodeData;
    case 'approval':
      return { title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 } as import('../types/workflow').ApprovalNodeData;
    case 'automated':
      return { title: 'Automated Step', actionId: '', actionParams: {} } as import('../types/workflow').AutomatedStepNodeData;
    case 'end':
    default:
      return { endMessage: 'Workflow complete.', summaryFlag: false } as import('../types/workflow').EndNodeData;
  }
}

// ─── Store ────────────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: INITIAL_NODES as WorkflowNode[],
  edges: INITIAL_EDGES,
  selectedNodeId: null,
  simulationResult: null,
  simulationOpen: false,
  simulationLoading: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `e-${nanoid()}`,
      animated: true,
      style: { stroke: '#c4b5fd', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' },
    };
    set({ edges: addEdge(newEdge, get().edges as any[]) as WorkflowEdge[] });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addWorkflowNode: (type, position) => {
    const id = `node-${nanoid()}`;
    const newNode: WorkflowNode = {
      id,
      type,
      position,
      data: getDefaultData(type),
    } as WorkflowNode;
    set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ) as WorkflowNode[],
    });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  setSimulationResult: (r) => set({ simulationResult: r }),
  setSimulationOpen: (open) => set({ simulationOpen: open }),
  setSimulationLoading: (loading) => set({ simulationLoading: loading }),

  clearWorkflow: () =>
    set({ nodes: [], edges: [], selectedNodeId: null, simulationResult: null }),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const { nodes, edges } = JSON.parse(json);
      set({ nodes, edges, selectedNodeId: null });
    } catch {
      console.error('Invalid workflow JSON');
    }
  },
}));
