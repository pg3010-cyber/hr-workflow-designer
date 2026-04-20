import React, { useState } from 'react';
import { Undo2, Redo2, Keyboard, X, LayoutGrid, Search } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'],     desc: 'Undo' },
  { keys: ['Ctrl', 'Y'],     desc: 'Redo' },
  { keys: ['Ctrl', 'L'],     desc: 'Auto-layout' },
  { keys: ['Ctrl', 'F'],     desc: 'Search nodes' },
  { keys: ['Del'],           desc: 'Delete selected node' },
  { keys: ['Esc'],           desc: 'Deselect / close search' },
  { keys: ['Ctrl', 'E'],     desc: 'Export workflow' },
];

export function FloatingToolbar() {
  const { undo, redo, canUndo, canRedo, runAutoLayout, setSearchQuery, searchQuery, highlightedIds } = useWorkflowStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const undoOk = canUndo();
  const redoOk = canRedo();

  const toggleSearch = () => {
    if (showSearch) { setSearchQuery(''); setShowSearch(false); }
    else { setShowSearch(true); setShowShortcuts(false); }
  };

  return (
    <>
      {/* ── Main toolbar pill ── */}
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
        <button onClick={undo} disabled={!undoOk}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: undoOk ? 'var(--accent-light)' : 'transparent', color: undoOk ? 'var(--accent)' : 'var(--text-muted)', cursor: undoOk ? 'pointer' : 'not-allowed' }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} /><span style={{ fontFamily: 'Outfit, sans-serif' }}>Undo</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Redo */}
        <button onClick={redo} disabled={!redoOk}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: redoOk ? 'var(--accent-light)' : 'transparent', color: redoOk ? 'var(--accent)' : 'var(--text-muted)', cursor: redoOk ? 'pointer' : 'not-allowed' }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={13} /><span style={{ fontFamily: 'Outfit, sans-serif' }}>Redo</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Auto-layout */}
        <button onClick={runAutoLayout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ color: 'var(--text-secondary)' }}
          title="Auto-layout (Ctrl+L)"
        >
          <LayoutGrid size={13} /><span style={{ fontFamily: 'Outfit, sans-serif' }}>Layout</span>
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Search */}
        <button onClick={toggleSearch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: showSearch ? 'var(--surface-2)' : 'transparent', color: highlightedIds.length > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}
          title="Search nodes (Ctrl+F)"
        >
          <Search size={13} />
          {highlightedIds.length > 0 && (
            <span className="rounded-full text-xs px-1" style={{ background: 'var(--accent)', color: 'white', fontSize: 9, fontWeight: 700 }}>
              {highlightedIds.length}
            </span>
          )}
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        {/* Keyboard hints */}
        <button onClick={() => { setShowShortcuts(v => !v); setShowSearch(false); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: showShortcuts ? 'var(--surface-2)' : 'transparent', color: 'var(--text-muted)' }}
          title="Keyboard shortcuts"
        >
          <Keyboard size={13} />
        </button>
      </div>

      {/* ── Search box ── */}
      {showSearch && (
        <div
          className="absolute top-16 left-1/2 z-20 rounded-2xl fade-in"
          style={{
            transform: 'translateX(-50%)',
            background: 'white',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'all',
            width: 280,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              autoFocus
              placeholder="Search nodes by title, type…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
              style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
                <X size={13} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="px-3 pb-2.5">
              <p className="text-xs" style={{ color: highlightedIds.length > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                {highlightedIds.length > 0 ? `${highlightedIds.length} node${highlightedIds.length !== 1 ? 's' : ''} matched` : 'No matches'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Shortcuts popover ── */}
      {showShortcuts && (
        <div
          className="absolute top-16 left-1/2 z-20 rounded-2xl p-4 fade-in"
          style={{
            transform: 'translateX(-50%)',
            background: 'white',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: 260,
            pointerEvents: 'all',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}>
              Keyboard Shortcuts
            </p>
            <button onClick={() => setShowShortcuts(false)}
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            ><X size={11} /></button>
          </div>
          <div className="space-y-2">
            {SHORTCUTS.map(({ keys, desc }) => (
              <div key={desc} className="flex items-center justify-between gap-4">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                <div className="flex gap-1">
                  {keys.map(k => (
                    <kbd key={k} className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 10 }}>
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
