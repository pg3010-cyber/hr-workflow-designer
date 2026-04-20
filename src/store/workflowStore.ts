import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection, MarkerType } from '@xyflow/react';
import type {
  WorkflowNode, WorkflowEdge, SimulationResult, StepStatus, StartNodeData,
} from '../types/workflow';
import { nanoid } from '../api/nanoid';

// ─── Initial data ─────────────────────────────────────────────────────────────
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
  { id: 'e1', source: 'node-start',      target: 'node-task-1',    ...EDGE_DEFAULTS },
  { id: 'e2', source: 'node-start',      target: 'node-approval-1',...EDGE_DEFAULTS },
  { id: 'e3', source: 'node-task-1',     target: 'node-auto-1',    ...EDGE_DEFAULTS },
  { id: 'e4', source: 'node-approval-1', target: 'node-auto-1',    ...EDGE_DEFAULTS },
  { id: 'e5', source: 'node-auto-1',     target: 'node-end',       ...EDGE_DEFAULTS },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface Snapshot { nodes: WorkflowNode[]; edges: WorkflowEdge[]; }
const MAX_HISTORY = 50;

function getDefaultData(type: string): WorkflowNode['data'] {
  switch (type) {
    case 'start':     return { title: 'Start', metadata: [] } as import('../types/workflow').StartNodeData;
    case 'task':      return { title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] } as import('../types/workflow').TaskNodeData;
    case 'approval':  return { title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 } as import('../types/workflow').ApprovalNodeData;
    case 'automated': return { title: 'Automated Step', actionId: '', actionParams: {} } as import('../types/workflow').AutomatedStepNodeData;
    case 'end':
    default:          return { endMessage: 'Workflow complete.', summaryFlag: false } as import('../types/workflow').EndNodeData;
  }
}

function snap(nodes: WorkflowNode[], edges: WorkflowEdge[]): Snapshot {
  return { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
}

function pushHistory(past: Snapshot[], nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  return [...past.slice(-MAX_HISTORY + 1), snap(nodes, edges)];
}

function computeHighlighted(nodes: WorkflowNode[], query: string): string[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return nodes
    .filter(n => JSON.stringify(n.data).toLowerCase().includes(q) || (n.type ?? '').includes(q))
    .map(n => n.id);
}

// Simple auto-layout: column per level using BFS
function autoLayoutNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  if (!nodes.length) return nodes;

  const inDeg   = new Map<string, number>();
  const children = new Map<string, string[]>();
  nodes.forEach(n => { inDeg.set(n.id, 0); children.set(n.id, []); });
  edges.forEach(e => {
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    children.get(e.source)?.push(e.target);
  });

  const level = new Map<string, number>();
  const queue: string[] = [];
  const tmpDeg = new Map(inDeg);

  for (const [id, d] of inDeg) if (d === 0) { queue.push(id); level.set(id, 0); }

  while (queue.length) {
    const curr = queue.shift()!;
    const lv = level.get(curr) ?? 0;
    for (const child of children.get(curr) ?? []) {
      const newLv = lv + 1;
      if (!level.has(child) || level.get(child)! < newLv) level.set(child, newLv);
      tmpDeg.set(child, (tmpDeg.get(child) ?? 1) - 1);
      if (tmpDeg.get(child) === 0) queue.push(child);
    }
  }

  nodes.forEach(n => { if (!level.has(n.id)) level.set(n.id, 0); });

  const byLevel = new Map<number, string[]>();
  for (const [id, lv] of level) {
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(id);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);
  let x = 80;
  for (const lv of sortedLevels) {
    const ids = byLevel.get(lv)!;
    const totalH = ids.length * 100 + (ids.length - 1) * 48;
    let y = 380 - totalH / 2;
    for (const id of ids) { positions.set(id, { x, y }); y += 148; }
    x += 310;
  }

  return nodes.map(n => ({ ...n, position: positions.get(n.id) ?? n.position }));
}

// LocalStorage persistence
const LS_KEY = 'flowhr-v1';
function loadLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { nodes: WorkflowNode[]; edges: WorkflowEdge[]; workflowName: string; savedAt: string };
  } catch { return null; }
}
function saveLS(nodes: WorkflowNode[], edges: WorkflowEdge[], name: string) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ nodes, edges, workflowName: name, savedAt: new Date().toISOString() })); } catch { /* ignore */ }
}
function clearLS() { try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ } }

let _saveTimer: ReturnType<typeof setTimeout> | null = null;
function debounceSave(nodes: WorkflowNode[], edges: WorkflowEdge[], name: string) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => { saveLS(nodes, edges, name); _saveTimer = null; }, 800);
}

const persisted = loadLS();

// ─── Store interface ──────────────────────────────────────────────────────────
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
  lastSavedAt: string | null;
  searchQuery: string;
  highlightedIds: string[];

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (id: string | null) => void;
  addWorkflowNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode['data']>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  runAutoLayout: () => void;
  setSearchQuery: (query: string) => void;
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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes:               (persisted?.nodes  as WorkflowNode[]) ?? INITIAL_NODES,
  edges:               (persisted?.edges  as WorkflowEdge[]) ?? INITIAL_EDGES,
  selectedNodeId:      null,
  workflowName:        persisted?.workflowName ?? 'Employee Onboarding',
  past:                [],
  future:              [],
  simulationResult:    null,
  simulationOpen:      false,
  simulationLoading:   false,
  simulationStatusMap: {},
  lastSavedAt:         persisted?.savedAt ?? null,
  searchQuery:         '',
  highlightedIds:      [],

  onNodesChange: (changes) => {
    const sig = changes.some(c => c.type === 'add' || c.type === 'remove');
    if (sig) {
      const { nodes, edges, past } = get();
      set({ past: pushHistory(past, nodes, edges), future: [] });
    }
    const newNodes = applyNodeChanges(changes, get().nodes) as WorkflowNode[];
    debounceSave(newNodes, get().edges, get().workflowName);
    set({ nodes: newNodes });
  },

  onEdgesChange: (changes) => {
    const sig = changes.some(c => c.type === 'add' || c.type === 'remove');
    if (sig) {
      const { nodes, edges, past } = get();
      set({ past: pushHistory(past, nodes, edges), future: [] });
    }
    const newEdges = applyEdgeChanges(changes, get().edges);
    debounceSave(get().nodes, newEdges, get().workflowName);
    set({ edges: newEdges });
  },

  onConnect: (connection) => {
    const { nodes, edges, past } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newEdge = {
      ...connection, id: `e-${nanoid()}`, animated: true,
      style: { stroke: '#c4b5fd', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' },
    };
    const newEdges = addEdge(newEdge, get().edges as any[]) as WorkflowEdge[];
    debounceSave(nodes, newEdges, get().workflowName);
    set({ edges: newEdges });
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addWorkflowNode: (type, position) => {
    const { nodes, edges, past, workflowName } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const id = `node-${nanoid()}`;
    const newNode = { id, type, position, data: getDefaultData(type) } as WorkflowNode;
    const newNodes = [...get().nodes, newNode];
    debounceSave(newNodes, edges, workflowName);
    set({ nodes: newNodes, selectedNodeId: id });
  },

  updateNodeData: (id, data) => {
    const { nodes, edges, past, workflowName, searchQuery } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newNodes = nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    ) as WorkflowNode[];
    debounceSave(newNodes, edges, workflowName);
    set({
      nodes: newNodes,
      highlightedIds: computeHighlighted(newNodes, searchQuery),
    });
  },

  deleteNode: (id) => {
    const { nodes, edges, past, workflowName } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newNodes = nodes.filter(n => n.id !== id);
    const newEdges = edges.filter(e => e.source !== id && e.target !== id);
    debounceSave(newNodes, newEdges, workflowName);
    set({
      nodes: newNodes, edges: newEdges,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  duplicateNode: (id) => {
    const { nodes, edges, past, workflowName } = get();
    const original = nodes.find(n => n.id === id);
    if (!original) return;
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const newId = `node-${nanoid()}`;
    const copy = {
      ...original, id: newId,
      position: { x: original.position.x + 50, y: original.position.y + 70 },
      data: JSON.parse(JSON.stringify(original.data)),
    } as WorkflowNode;
    const newNodes = [...get().nodes, copy];
    debounceSave(newNodes, edges, workflowName);
    set({ nodes: newNodes, selectedNodeId: newId });
  },

  runAutoLayout: () => {
    const { nodes, edges, past, workflowName } = get();
    set({ past: pushHistory(past, nodes, edges), future: [] });
    const laid = autoLayoutNodes(nodes, edges);
    debounceSave(laid, edges, workflowName);
    set({ nodes: laid });
  },

  setSearchQuery: (query) => {
    const { nodes } = get();
    set({ searchQuery: query, highlightedIds: computeHighlighted(nodes, query) });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [snap(nodes, edges), ...future.slice(0, MAX_HISTORY - 1)],
      nodes: prev.nodes, edges: prev.edges, selectedNodeId: null,
    });
  },

  redo: () => {
    const { past, nodes, edges, future } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: pushHistory(past, nodes, edges),
      nodes: next.nodes, edges: next.edges, selectedNodeId: null,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setSimulationResult:    (r)   => set({ simulationResult: r }),
  setSimulationOpen:      (open) => set({ simulationOpen: open }),
  setSimulationLoading:   (l)   => set({ simulationLoading: l }),
  setSimulationStatusMap: (map) => set({ simulationStatusMap: map }),

  clearWorkflow: () => {
    clearLS();
    set({ nodes: [], edges: [], selectedNodeId: null, simulationResult: null,
          simulationStatusMap: {}, past: [], future: [], searchQuery: '',
          highlightedIds: [], lastSavedAt: null });
  },

  setWorkflowName: (name) => {
    debounceSave(get().nodes, get().edges, name);
    set({ workflowName: name });
  },

  loadTemplate: (nodes, edges, name) => {
    clearLS();
    debounceSave(nodes, edges, name);
    set({ nodes, edges, workflowName: name, selectedNodeId: null,
          simulationResult: null, simulationStatusMap: {},
          past: [], future: [], searchQuery: '', highlightedIds: [] });
  },

  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    return JSON.stringify({ workflowName, nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const p = JSON.parse(json);
      set({ nodes: p.nodes ?? [], edges: p.edges ?? [],
            workflowName: p.workflowName ?? 'Imported Workflow',
            selectedNodeId: null, past: [], future: [] });
    } catch { console.error('Invalid workflow JSON'); }
  },
}));
