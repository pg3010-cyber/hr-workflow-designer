import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';

const NODE_W   = 232;
const NODE_H   = 100;
const H_GAP    = 90;
const V_GAP    = 48;
const PAD_X    = 80;
const PAD_Y    = 60;
const CENTER_Y = 380;

/**
 * Auto-layout: Sugiyama-inspired level assignment via Kahn's BFS,
 * then vertical centering per level.  Zero external dependencies.
 */
export function autoLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  if (nodes.length === 0) return nodes;

  // ─── 1. Build graph structures ─────────────────────────────────────
  const inDeg   = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const n of nodes) { inDeg.set(n.id, 0); children.set(n.id, []); }
  for (const e of edges) {
    if (!inDeg.has(e.target)) continue;
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    children.get(e.source)?.push(e.target);
  }

  // ─── 2. BFS level assignment ────────────────────────────────────────
  const level  = new Map<string, number>();
  const deg    = new Map(inDeg);
  const queue: string[] = [];

  for (const [id, d] of inDeg) if (d === 0) { queue.push(id); level.set(id, 0); }

  while (queue.length) {
    const curr = queue.shift()!;
    const lv   = level.get(curr) ?? 0;
    for (const child of children.get(curr) ?? []) {
      const newLv = lv + 1;
      if (!level.has(child) || level.get(child)! < newLv) level.set(child, newLv);
      deg.set(child, (deg.get(child) ?? 1) - 1);
      if (deg.get(child) === 0) queue.push(child);
    }
  }

  // Fallback for isolated / cycle nodes
  for (const n of nodes) if (!level.has(n.id)) level.set(n.id, 0);

  // ─── 3. Group by level ──────────────────────────────────────────────
  const byLevel = new Map<number, string[]>();
  for (const [id, lv] of level) {
    if (!byLevel.has(lv)) byLevel.set(lv, []);
    byLevel.get(lv)!.push(id);
  }

  // Sort nodes within each level: start nodes first, end nodes last
  const typeOrder: Record<string, number> = {
    start: 0, task: 1, approval: 2, automated: 3, end: 4,
  };
  const nodeType = new Map(nodes.map(n => [n.id, n.type as string]));
  for (const ids of byLevel.values()) {
    ids.sort((a, b) => (typeOrder[nodeType.get(a) ?? ''] ?? 2) - (typeOrder[nodeType.get(b) ?? ''] ?? 2));
  }

  // ─── 4. Assign x/y positions ────────────────────────────────────────
  const positions = new Map<string, { x: number; y: number }>();
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);

  let x = PAD_X;
  for (const lv of sortedLevels) {
    const ids         = byLevel.get(lv)!;
    const totalHeight = ids.length * NODE_H + (ids.length - 1) * V_GAP;
    let   y           = CENTER_Y - totalHeight / 2 + PAD_Y;

    for (const id of ids) {
      positions.set(id, { x, y });
      y += NODE_H + V_GAP;
    }
    x += NODE_W + H_GAP;
  }

  // ─── 5. Return updated nodes ─────────────────────────────────────────
  return nodes.map(n => ({
    ...n,
    position: positions.get(n.id) ?? n.position,
  }));
}
