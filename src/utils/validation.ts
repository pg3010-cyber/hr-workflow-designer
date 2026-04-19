import type { WorkflowNode, WorkflowEdge, ValidationError } from '../types/workflow';

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes   = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0)
    errors.push({ message: 'Workflow must have a Start node.', severity: 'error' });
  if (startNodes.length > 1)
    errors.push({ message: 'Workflow can have only one Start node.', severity: 'error' });
  if (endNodes.length === 0)
    errors.push({ message: 'Workflow must have an End node.', severity: 'error' });

  // Orphaned node check (not start/end and no edges)
  const connectedIds = new Set<string>();
  edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target); });
  nodes.forEach((n) => {
    if (n.type !== 'start' && n.type !== 'end' && !connectedIds.has(n.id)) {
      const d = n.data as Record<string, unknown>;
      errors.push({
        nodeId: n.id,
        message: `Node "${d.title || n.type}" is disconnected.`,
        severity: 'warning',
      });
    }
  });

  return errors;
}
