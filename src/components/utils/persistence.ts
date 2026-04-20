/**
 * Lightweight localStorage persistence for the workflow store.
 * Called once on app boot to rehydrate, and on every store change to save.
 */

import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';

const KEY = 'flowhr-workflow-v1';

interface PersistedWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  workflowName: string;
  savedAt: string;
}

export function loadPersistedWorkflow(): PersistedWorkflow | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkflow;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  workflowName: string
): void {
  try {
    const data: PersistedWorkflow = {
      nodes, edges, workflowName,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function clearPersistedWorkflow(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
