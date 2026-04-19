import React from 'react';
import { Play, ClipboardList, ShieldCheck, Zap, Flag, GripVertical } from 'lucide-react';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  icon: React.ReactNode;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    bgColor: 'var(--start-bg)',
    borderColor: 'var(--start-border)',
    iconColor: 'var(--start-icon)',
    textColor: 'var(--start-text)',
    icon: <Play size={14} fill="currentColor" />,
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human task step',
    bgColor: 'var(--task-bg)',
    borderColor: 'var(--task-border)',
    iconColor: 'var(--task-icon)',
    textColor: 'var(--task-text)',
    icon: <ClipboardList size={14} />,
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Manager or HR sign-off',
    bgColor: 'var(--approval-bg)',
    borderColor: 'var(--approval-border)',
    iconColor: 'var(--approval-icon)',
    textColor: 'var(--approval-text)',
    icon: <ShieldCheck size={14} />,
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'System-triggered action',
    bgColor: 'var(--auto-bg)',
    borderColor: 'var(--auto-border)',
    iconColor: 'var(--auto-icon)',
    textColor: 'var(--auto-text)',
    icon: <Zap size={14} />,
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    bgColor: 'var(--end-bg)',
    borderColor: 'var(--end-border)',
    iconColor: 'var(--end-icon)',
    textColor: 'var(--end-text)',
    icon: <Flag size={14} />,
  },
];

export function NodePalette() {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 220,
        background: 'white',
        borderRight: '1.5px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-5 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}
        >
          Node Palette
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Drag nodes onto the canvas
        </p>
      </div>

      {/* Node cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all duration-150 select-none"
            style={{
              border: `1.5px solid ${item.borderColor}`,
              background: item.bgColor,
            }}
            title={`Drag to add ${item.label} node`}
          >
            {/* Grip icon */}
            <GripVertical
              size={12}
              className="opacity-30 group-hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ color: item.iconColor }}
            />

            {/* Icon */}
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', color: item.iconColor }}
            >
              {item.icon}
            </span>

            {/* Text */}
            <div className="min-w-0">
              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: item.textColor, fontFamily: 'Outfit, sans-serif' }}
              >
                {item.label}
              </p>
              <p className="text-xs leading-tight mt-0.5 truncate" style={{ color: item.iconColor, opacity: 0.7 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer tips */}
      <div
        className="p-4 space-y-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 10 }}
        >
          Quick Tips
        </p>
        {[
          '↕ Drag nodes to reorder',
          '→ Connect handles to link',
          '✎ Click node to edit',
          '⌫ Delete button on hover',
        ].map((tip, i) => (
          <p key={i} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {tip}
          </p>
        ))}
      </div>
    </aside>
  );
}
