import React, { useRef, useState } from 'react';
import {
  Play, Download, Upload, Trash2, Workflow,
  GitBranch, Layers, Undo2, Redo2, Pencil, Check, Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { TemplateModal } from './templates/TemplateModal';

export function Header() {
  const {
    nodes, edges,
    setSimulationOpen, simulationLoading,
    clearWorkflow, exportWorkflow, importWorkflow,
    undo, redo, canUndo, canRedo,
    workflowName, setWorkflowName,
  } = useWorkflowStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(workflowName);
  const [templateOpen, setTemplateOpen] = useState(false);

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'workflow.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importWorkflow(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const commitName = () => {
    setWorkflowName(nameInput.trim() || 'Untitled Workflow');
    setEditingName(false);
  };

  const isValid = nodes.filter(n => n.type === 'start').length === 1
    && nodes.filter(n => n.type === 'end').length >= 1;

  // Node type breakdown for stat chips
  const typeBreakdown: Record<string, { color: string; label: string }> = {
    start:     { color: '#16a34a', label: '▶' },
    task:      { color: '#1d4ed8', label: 'T' },
    approval:  { color: '#b45309', label: 'A' },
    automated: { color: '#7c3aed', label: '⚡' },
    end:       { color: '#be185d', label: '■' },
  };
  const nodeTypeCounts = nodes.reduce((acc, n) => {
    acc[n.type as string] = (acc[n.type as string] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <header
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{ background: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 10 }}
      >
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Workflow size={16} color="white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>
            FlowHR
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* Editable workflow name */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                className="text-sm font-semibold bg-transparent border-b outline-none text-white"
                style={{ borderColor: 'var(--accent)', fontFamily: 'Outfit, sans-serif', minWidth: 120, maxWidth: 200 }}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
              />
              <button onClick={commitName} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent)', color: 'white' }}>
                <Check size={11} />
              </button>
            </div>
          ) : (
            <button
              className="group flex items-center gap-1.5 text-sm font-semibold transition-opacity"
              style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Outfit, sans-serif' }}
              onClick={() => { setNameInput(workflowName); setEditingName(true); }}
              title="Click to rename workflow"
            >
              {workflowName}
              <Pencil size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </button>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={undo} disabled={!canUndo()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: canUndo() ? 'rgba(255,255,255,0.1)' : 'transparent', color: canUndo() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', cursor: canUndo() ? 'pointer' : 'not-allowed' }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo} disabled={!canRedo()}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: canRedo() ? 'rgba(255,255,255,0.1)' : 'transparent', color: canRedo() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', cursor: canRedo() ? 'pointer' : 'not-allowed' }}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Node type breakdown */}
        <div className="hidden md:flex items-center gap-1.5">
          {Object.entries(nodeTypeCounts).map(([type, count]) => {
            const tb = typeBreakdown[type];
            if (!tb) return null;
            return (
              <div key={type} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: tb.color }}>{tb.label}</span>
                <span>{count}</span>
              </div>
            );
          })}
          {nodes.length > 0 && (
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
              <GitBranch size={11} /> {edges.length}e
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Templates */}
        <button
          onClick={() => setTemplateOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          title="Browse templates (Ctrl+T)"
        >
          <Sparkles size={13} /> Templates
        </button>

        {/* Import */}
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          title="Import workflow JSON"
        >
          <Upload size={13} />
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          title="Export workflow JSON (Ctrl+E)"
        >
          <Download size={13} />
        </button>

        {/* Clear */}
        <button
          onClick={clearWorkflow}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-xl transition-all flex-shrink-0"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5' }}
          title="Clear canvas"
        >
          <Trash2 size={13} />
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Run */}
        <button
          onClick={() => setSimulationOpen(true)}
          disabled={simulationLoading}
          className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-xl font-semibold transition-all flex-shrink-0"
          style={{
            background: isValid ? 'var(--accent)' : 'rgba(124,58,237,0.35)',
            color: 'white',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: isValid ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
          }}
          title={!isValid ? 'Add a Start and End node first' : 'Run workflow simulation'}
        >
          <Play size={14} fill="white" /> Run
        </button>
      </header>

      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} />
    </>
  );
}
