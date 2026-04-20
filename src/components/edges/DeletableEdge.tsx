import React, { useState } from 'react';
import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export function DeletableEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  selected,
  markerEnd,
  style,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const { edges, onEdgesChange } = useWorkflowStore();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Fire a remove change through the store's onEdgesChange
    onEdgesChange([{ id, type: 'remove' }]);
  };

  const isVisible = hovered || selected;

  return (
    <>
      {/* Invisible wide hit area for hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Actual visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? 'var(--accent)' : isVisible ? '#a78bfa' : '#c4b5fd',
          strokeWidth: selected ? 2.5 : isVisible ? 2 : 1.5,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
      />

      {/* Delete button rendered in label position */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.15s',
            zIndex: 10,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="nodrag nopan"
        >
          <button
            onClick={handleDelete}
            className="flex items-center justify-center rounded-full transition-all"
            style={{
              width: 18, height: 18,
              background: '#fee2e2',
              border: '1.5px solid #fca5a5',
              color: '#dc2626',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
            title="Delete connection"
          >
            <X size={9} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const EDGE_TYPES = { default: DeletableEdge };
