import React, { useRef } from 'react';
import {
  Play, Download, Upload, Trash2, Workflow,
  GitBranch, Layers,
} from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

export function Header() {
  const {
    nodes, edges,
    setSimulationOpen, setSimulationLoading, setSimulationResult,
    simulationLoading, clearWorkflow,
    exportWorkflow, importWorkflow,
  } = useWorkflowStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunSimulation = () => {
    setSimulationOpen(true);
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      importWorkflow(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startNodes  = nodes.filter((n) => n.type === 'start').length;
  const endNodes    = nodes.filter((n) => n.type === 'end').length;
  const isValid     = startNodes === 1 && endNodes >= 1;

  return (
    <header
      className="flex items-center justify-between px-5 h-14 flex-shrink-0"
      style={{
        background: 'var(--text-primary)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <Workflow size={16} color="white" />
        </div>
        <div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: 'white', fontFamily: 'Outfit, sans-serif' }}
          >
            FlowHR
          </span>
          <span
            className="ml-2 text-xs"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Workflow Designer
          </span>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          <Layers size={12} />
          <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          <GitBranch size={12} />
          <span>{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Import */}
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          title="Import workflow JSON"
        >
          <Upload size={13} /> Import
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          title="Export workflow as JSON"
        >
          <Download size={13} /> Export
        </button>

        {/* Clear */}
        <button
          onClick={clearWorkflow}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium"
          style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5' }}
          title="Clear all nodes"
        >
          <Trash2 size={13} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

        {/* Run Simulation */}
        <button
          onClick={handleRunSimulation}
          disabled={simulationLoading}
          className="flex items-center gap-2 text-sm px-4 py-1.5 rounded-xl font-semibold transition-all"
          style={{
            background: isValid ? 'var(--accent)' : 'rgba(124,58,237,0.4)',
            color: 'white',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: isValid ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
            cursor: simulationLoading ? 'wait' : 'pointer',
          }}
          title={!isValid ? 'Add a Start and End node to run' : 'Run workflow simulation'}
        >
          <Play size={14} fill="white" />
          Run
        </button>
      </div>
    </header>
  );
}
