import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, useReactFlow, ReactFlowProvider,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import { NODE_TYPES } from '../nodes/index';
import { EDGE_TYPES } from '../edges/DeletableEdge';
import { FloatingToolbar } from './FloatingToolbar';

function Canvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    setSelectedNode, addWorkflowNode,
    undo, redo, canUndo, canRedo,
    exportWorkflow, deleteNode, selectedNodeId,
    runAutoLayout, setSearchQuery, highlightedIds,
    simulationStatusMap,
  } = useWorkflowStore();

  const { screenToFlowPosition } = useReactFlow();

  // ── Apply search highlight style to nodes ──────────────────────────
  const displayNodes = nodes.map(n => {
    const { searchQuery } = useWorkflowStore.getState();
    const isSearchActive = searchQuery.trim() !== '';
    if (!isSearchActive) return n;
    const dimmed  = !highlightedIds.includes(n.id);
    return {
      ...n,
      style: {
        ...(n.style ?? {}),
        opacity: dimmed ? 0.25 : 1,
        transition: 'opacity 0.2s',
      },
    };
  });

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    addWorkflowNode(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }, [screenToFlowPosition, addWorkflowNode]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (isInput) return;
        e.preventDefault(); if (canUndo()) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (isInput) return;
        e.preventDefault(); if (canRedo()) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        if (isInput) return;
        e.preventDefault(); runAutoLayout();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // Focus the search — FloatingToolbar handles its own toggle via store
        // We trigger a custom event the toolbar listens to
        document.dispatchEvent(new CustomEvent('flowhr-search-open'));
      } else if (e.key === 'Escape') {
        setSelectedNode(null);
        setSearchQuery('');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && !isInput) {
        deleteNode(selectedNodeId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !isInput) {
        e.preventDefault();
        const json = exportWorkflow();
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'workflow.json'; a.click();
        URL.revokeObjectURL(url);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo, canUndo, canRedo, setSelectedNode, selectedNodeId, deleteNode, exportWorkflow, runAutoLayout, setSearchQuery]);

  return (
    <div ref={wrapperRef} style={{ flex: 1, height: '100%', position: 'relative' }}>
      <FloatingToolbar />
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        minZoom={0.25}
        maxZoom={2}
        style={{ background: 'var(--bg)' }}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { stroke: '#c4b5fd', strokeWidth: 2 },
          markerEnd: { type: 'arrowclosed', color: '#c4b5fd' },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#d8d0f0" />
        <Controls position="bottom-right" style={{ bottom: 24, right: 24 }} />
        <MiniMap
          position="bottom-left"
          style={{ bottom: 24, left: 24 }}
          nodeColor={n => {
            const c: Record<string, string> = { start: '#86efac', task: '#93c5fd', approval: '#fde047', automated: '#c4b5fd', end: '#f9a8d4' };
            return c[n.type as string] ?? '#e0e0e0';
          }}
          maskColor="rgba(247,246,255,0.6)"
          nodeStrokeWidth={3}
        />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center fade-in">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M17 14v6M14 17h6" />
                </svg>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Drag nodes from the left panel</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>or pick a template from the header</p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return <ReactFlowProvider><Canvas /></ReactFlowProvider>;
}
