import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

interface NodeWrapperProps {
  id: string;
  selected?: boolean;
  nodeType: string;
  label: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  hasTopHandle?: boolean;
  hasBottomHandle?: boolean;
}

export function NodeWrapper({
  id,
  selected,
  nodeType,
  label,
  bgColor,
  borderColor,
  iconColor,
  textColor,
  icon,
  children,
  hasTopHandle = true,
  hasBottomHandle = true,
}: NodeWrapperProps) {
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        width: 220,
        background: 'white',
        border: `1.5px solid ${selected ? 'var(--accent)' : borderColor}`,
        boxShadow: selected
          ? 'var(--shadow-node-selected)'
          : 'var(--shadow-node)',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Delete button */}
      <button
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ background: '#fee2e2', color: '#dc2626' }}
        onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
        title="Delete node"
      >
        <X size={11} strokeWidth={2.5} />
      </button>

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: bgColor }}
      >
        <span
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'white', color: iconColor }}
        >
          {icon}
        </span>
        <span
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: textColor, fontFamily: 'Outfit, sans-serif', fontSize: 10 }}
        >
          {label}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5" style={{ minHeight: 40 }}>
        {children}
      </div>

      {/* Handles */}
      {hasTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ top: -6, background: 'var(--auto-icon)' }}
        />
      )}
      {hasBottomHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ bottom: -6, background: 'var(--auto-icon)' }}
        />
      )}
    </div>
  );
}
