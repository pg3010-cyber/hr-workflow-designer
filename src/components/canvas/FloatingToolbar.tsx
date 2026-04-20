import React, { useState } from 'react';
import { Undo2, Redo2, Keyboard, X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], desc: 'Undo' },
  { keys: ['Ctrl', 'Y'], desc: 'Redo' },
  { keys: ['Del'], desc: 'Delete selected node' },
  { keys: ['Esc'], desc: 'Deselect node' },
  { keys: ['Ctrl', 'E'], desc: 'Export workflow' },
  { keys: ['Ctrl', 'T'], desc: 'Open templates' },
];

export function FloatingToolbar() {
  const { undo, redo, canUndo, canRedo } = useWorkflowStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const undoEnabled = canUndo();
  const redoEnabled = canRedo();

  return (
    <>
      <div
        className="absolute top-4 left-1/2 z-10 flex items-center gap-1 rounded-2xl px-3 py-2"
        style={{
          transform: 'translateX(-50%)',
          background: 'white',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'all',
        }}
      >
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!undoEnabled}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: undoEnabled ? 'var(--accent-light)' : 'transparent',
            color: undoEnabled ? 'var(--accent)' : 'var(--text-muted)',
            cursor: undoEnabled ? 'pointer' : 'not-allowed',
          }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} />
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>Undo</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!redoEnabled}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: redoEnabled ? 'var(--accent-light)' : 'transparent',
            color: redoEnabled ? 'var(--accent)' : 'var(--text-muted)',
            cursor: redoEnabled ? 'pointer' : 'not-allowed',
          }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={13} />
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>Redo</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Shortcuts hint */}
        <button
          onClick={() => setShowShortcuts(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: showShortcuts ? 'var(--surface-2)' : 'transparent',
            color: 'var(--text-muted)',
          }}
          title="Keyboard shortcuts"
        >
          <Keyboard size={13} />
        </button>
      </div>

      {/* Shortcuts popover */}
      {showShortcuts && (
        <div
          className="absolute top-16 left-1/2 z-20 rounded-2xl p-4 fade-in"
          style={{
            transform: 'translateX(-50%)',
            background: 'white',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: 240,
            pointerEvents: 'all',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}>
              Keyboard Shortcuts
            </p>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            >
              <X size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {SHORTCUTS.map(({ keys, desc }) => (
              <div key={desc} className="flex items-center justify-between gap-4">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                <div className="flex gap-1">
                  {keys.map(k => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: 10,
                      }}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
