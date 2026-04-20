import React from 'react';
import { X, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from '../../data/templates';
import { useWorkflowStore } from '../../store/workflowStore';

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
}

function MiniFlowPreview({ template }: { template: WorkflowTemplate }) {
  const nodeTypes = template.nodes.map(n => n.type);
  const typeColors: Record<string, string> = {
    start: '#86efac', task: '#93c5fd', approval: '#fde047',
    automated: '#c4b5fd', end: '#f9a8d4',
  };

  // Build simple visual columns for preview
  const startNodes = template.nodes.filter(n => n.type === 'start');
  const endNodes = template.nodes.filter(n => n.type === 'end');
  const middleNodes = template.nodes.filter(n => n.type !== 'start' && n.type !== 'end');

  const nodeLabels: Record<string, string> = {
    start: 'S', task: 'T', approval: 'A', automated: '⚡', end: 'E',
  };

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ height: 80, background: '#f7f6ff', border: '1.5px solid #e4ddf8' }}>
      {/* Dot grid */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 16 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={col * 20 + 10} cy={row * 20 + 10} r={1} fill="#d8d0f0" />
          ))
        )}
      </svg>

      {/* Node representation */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 px-3">
        {template.nodes.slice(0, 6).map((node, i) => (
          <React.Fragment key={node.id}>
            {i > 0 && (
              <div style={{ width: 12, height: 1.5, background: '#c4b5fd', borderRadius: 1, flexShrink: 0 }} />
            )}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold"
              style={{
                width: 28, height: 24,
                background: typeColors[node.type as string] ?? '#e0e0e0',
                border: `1.5px solid ${typeColors[node.type as string] ?? '#e0e0e0'}`,
                fontSize: 9,
                fontFamily: 'Outfit, sans-serif',
                color: '#1c1535',
              }}
            >
              {nodeLabels[node.type as string] ?? '?'}
            </div>
          </React.Fragment>
        ))}
        {template.nodes.length > 6 && (
          <span style={{ fontSize: 10, color: '#a89fd0' }}>+{template.nodes.length - 6}</span>
        )}
      </div>
    </div>
  );
}

export function TemplateModal({ open, onClose }: TemplateModalProps) {
  const { loadTemplate } = useWorkflowStore();

  const handleSelect = (template: WorkflowTemplate) => {
    loadTemplate(template.nodes, template.edges, template.name);
    onClose();
  };

  const handleBlank = () => {
    useWorkflowStore.getState().clearWorkflow();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(28,21,53,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 fade-in"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720, maxWidth: '95vw',
          maxHeight: '88vh',
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 flex-shrink-0"
          style={{ background: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <p className="font-bold text-base text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Start with a template
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                Pick a pre-built workflow or start from scratch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Blank canvas option */}
          <button
            onClick={handleBlank}
            className="w-full flex items-center gap-4 rounded-2xl p-4 mb-5 transition-all text-left group"
            style={{
              border: '1.5px dashed var(--border)',
              background: 'var(--bg)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Plus size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                Blank Canvas
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Start from scratch and build your own workflow
              </p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--accent)', marginLeft: 'auto' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Templates grid */}
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}>
            Templates
          </p>
          <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
            {WORKFLOW_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="text-left rounded-2xl p-4 transition-all group relative overflow-hidden"
                style={{
                  background: 'white',
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = template.color;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${template.color}22`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: template.bgColor, color: template.color, fontFamily: 'Outfit, sans-serif', fontSize: 10 }}
                  >
                    {template.category}
                  </span>
                  <span style={{ fontSize: 20 }}>{template.emoji}</span>
                </div>

                {/* Preview */}
                <MiniFlowPreview template={template} />

                {/* Info */}
                <div className="mt-3">
                  <p className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                    {template.name}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {template.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {template.nodes.length} nodes · {template.edges.length} edges
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: template.color }}
                  >
                    Use template <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
