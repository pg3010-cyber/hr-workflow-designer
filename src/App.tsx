import React, { useState } from 'react';
import { Header } from './components/Header';
import { NodePalette } from './components/canvas/NodePalette';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SandboxPanel } from './components/sandbox/SandboxPanel';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <NodePalette />
        <WorkflowCanvas />
        <NodeFormPanel />
      </div>
      <SandboxPanel />
    </div>
  );
}
