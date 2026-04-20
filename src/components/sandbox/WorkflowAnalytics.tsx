import React, { useMemo } from 'react';
import { GitBranch, Activity, Clock, BarChart2, Layers, CheckCircle2 } from 'lucide-react';
import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';

interface Props {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

function computeMetrics(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  // Node type breakdown
  const typeCounts = nodes.reduce((acc, n) => {
    acc[n.type as string] = (acc[n.type as string] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Connectivity: nodes that have at least one edge
  const connectedIds = new Set<string>();
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
  const connectivity = nodes.length ? Math.round((connectedIds.size / nodes.length) * 100) : 0;

  // Critical path length: longest chain from start to end
  const children = new Map<string, string[]>();
  nodes.forEach(n => children.set(n.id, []));
  edges.forEach(e => children.get(e.source)?.push(e.target));

  let maxDepth = 0;
  function dfs(id: string, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    for (const child of children.get(id) ?? []) dfs(child, depth + 1);
  }
  nodes.filter(n => n.type === 'start').forEach(n => dfs(n.id, 1));

  // Number of parallel paths (edges that fan out from one source)
  const parallelForks = nodes.filter(n => (children.get(n.id)?.length ?? 0) > 1).length;

  // Automation ratio
  const autoCount  = typeCounts['automated'] ?? 0;
  const totalWork  = (typeCounts['task'] ?? 0) + (typeCounts['approval'] ?? 0) + autoCount;
  const autoRatio  = totalWork > 0 ? Math.round((autoCount / totalWork) * 100) : 0;

  return { typeCounts, connectivity, criticalPath: maxDepth, parallelForks, autoRatio, totalWork };
}

export function WorkflowAnalytics({ nodes, edges }: Props) {
  const m = useMemo(() => computeMetrics(nodes, edges), [nodes, edges]);

  const typeColors: Record<string, string> = {
    start: '#16a34a', task: '#1d4ed8', approval: '#b45309',
    automated: '#7c3aed', end: '#be185d',
  };

  const metrics = [
    {
      icon: <Activity size={14} />,
      label: 'Connectivity',
      value: `${m.connectivity}%`,
      sub: `${m.connectivity === 100 ? 'All nodes connected' : 'Some nodes isolated'}`,
      color: m.connectivity === 100 ? '#16a34a' : '#d97706',
      bg: m.connectivity === 100 ? '#dcfce7' : '#fef9c3',
    },
    {
      icon: <GitBranch size={14} />,
      label: 'Critical Path',
      value: `${m.criticalPath} steps`,
      sub: `Longest execution chain`,
      color: '#7c3aed',
      bg: '#ede9fe',
    },
    {
      icon: <Layers size={14} />,
      label: 'Parallel Forks',
      value: `${m.parallelForks}`,
      sub: `Nodes with multiple outputs`,
      color: '#1d4ed8',
      bg: '#dbeafe',
    },
    {
      icon: <BarChart2 size={14} />,
      label: 'Automation Ratio',
      value: `${m.autoRatio}%`,
      sub: `Of total work nodes`,
      color: '#7c3aed',
      bg: '#ede9fe',
    },
  ];

  return (
    <div className="fade-in" style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16 }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}>
        Workflow Analytics
      </p>

      {/* Metric cards */}
      <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl p-3"
            style={{ background: m.bg, border: `1px solid ${m.color}22` }}>
            <div className="flex items-center gap-1.5 mb-1" style={{ color: m.color }}>
              {m.icon}
              <span className="text-xs font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.label}</span>
            </div>
            <p className="text-lg font-bold leading-none" style={{ color: m.color, fontFamily: 'Outfit, sans-serif' }}>
              {m.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: m.color, opacity: 0.75 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Node type breakdown bar */}
      {nodes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
            Node Composition
          </p>
          <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
            {Object.entries(m.typeCounts).map(([type, count]) => (
              <div key={type}
                style={{
                  flex: count,
                  background: typeColors[type] ?? '#e0e0e0',
                  transition: 'flex 0.3s',
                }}
                title={`${type}: ${count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {Object.entries(m.typeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: typeColors[type] ?? '#e0e0e0' }} />
                <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{type} ({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
