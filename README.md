# FlowHR — HR Workflow Designer

A visual drag-and-drop workflow builder for HR admins. Design, configure, and simulate internal workflows like onboarding, leave approval, and document verification.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

To build for production:
```bash
npm run build
npm run preview
```

---

## 🗂 Architecture

```
src/
├── api/
│   ├── mockApi.ts          # Mock GET /automations + POST /simulate
│   └── nanoid.ts           # Tiny ID generator
├── components/
│   ├── Header.tsx           # Top bar: branding, stats, export/import, run button
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx  # ReactFlow canvas with drag-drop + event handling
│   │   └── NodePalette.tsx     # Left sidebar: draggable node type cards
│   ├── forms/
│   │   └── NodeFormPanel.tsx   # Right panel: node-type-specific edit forms
│   ├── nodes/
│   │   ├── NodeWrapper.tsx     # Shared card layout for all node types
│   │   └── index.tsx           # All 5 node components + NODE_TYPES map
│   └── sandbox/
│       └── SandboxPanel.tsx    # Simulation drawer: run + step-by-step results
├── store/
│   └── workflowStore.ts    # Zustand store (nodes, edges, selection, simulation)
├── types/
│   └── workflow.ts         # All TypeScript interfaces
├── utils/
│   └── validation.ts       # Client-side pre-flight validation
├── App.tsx                  # Root layout (Header + Palette + Canvas + Form)
└── main.tsx
```

---

## ✨ Features

### Workflow Canvas (React Flow)
- **Drag & Drop**: Drag node types from the palette onto the canvas
- **Connect**: Click and drag from a handle to another node to create an edge
- **Select**: Click a node to open its edit form in the right panel
- **Delete**: Hover over a node to reveal the delete button; or press `Delete` key
- **Fit View**: ReactFlow controls (bottom-right) to zoom/fit
- **Mini-map**: Overview in bottom-left corner

### Node Types
| Node | Color | Purpose |
|------|-------|---------|
| **Start** | 🟢 Mint | Workflow entry point; title + metadata key-value pairs |
| **Task** | 🔵 Sky | Human task; title, description, assignee, due date, custom fields |
| **Approval** | 🟡 Yellow | Manager/HR sign-off; approver role, auto-approve threshold |
| **Automated** | 🟣 Purple | System action; dropdown from mock API, dynamic param inputs |
| **End** | 🩷 Pink | Workflow completion; end message, summary flag toggle |

### Mock API Layer
- `GET /automations` — Returns 8 mock actions (Send Email, Generate Document, Notify Slack, etc.)
- `POST /simulate` — Accepts the full workflow graph, runs topological sort, returns step-by-step results

### Sandbox Panel
- Validates workflow structure before running (missing Start/End, cycles, disconnected nodes)
- Shows step-by-step execution log with status chips, timestamps, and details
- Summary bar shows total steps, completed, pending, and execution time

### Import / Export
- **Export**: Downloads workflow as `workflow.json`
- **Import**: Load any previously exported workflow JSON

---

## 🎨 Design Decisions

- **Pastel color system**: Each node type has its own pastel palette (bg / border / icon) defined as CSS variables, making theming trivial.
- **Outfit + DM Sans**: Display font for headings (clean, geometric), body font for forms (highly readable).
- **No pixel-perfect mandate**: The focus per the brief is architectural clarity and working functionality; the UI is polished but not over-engineered.
- **Zustand over Context**: Simpler API, no provider boilerplate, easy to extend with slices.
- **Single `NodeFormPanel.tsx`**: All form components live in one file — the conditional rendering is clear, and adding a new node type is a 3-step change: add type, add data interface, add form component.

---

## 🔌 Extending the Project

### Add a new node type
1. Add `type NewNodeData` to `src/types/workflow.ts`
2. Add a new `NodeComponent` to `src/components/nodes/index.tsx`
3. Add its `NodeConfig` to the palette in `NodePalette.tsx`
4. Add a `NewNodeForm` in `NodeFormPanel.tsx`
5. Handle it in `getDefaultData()` in `workflowStore.ts`
6. Handle it in `postSimulate()` in `mockApi.ts`

### Replace mock API with a real backend
The API surface is intentionally thin — swap `src/api/mockApi.ts` for real `fetch` calls to your FastAPI/Express backend.

---

## 🧠 What I'd Add With More Time
- **Undo/Redo** (Zustand middleware or immer patches)
- **Node templates** (save/load preset configurations)
- **Validation overlays** on individual nodes (red ring with tooltip)
- **Auto-layout** (ELK.js or dagre)
- **Collaborative editing** (Liveblocks or Yjs)
- **Unit tests** (Vitest + RTL for forms; Cypress for canvas E2E)
- **Workflow versioning** (history panel per-workflow)
