# FlowHR — HR Workflow Designer

A visual drag-and-drop workflow builder for HR admins. Design, configure, and simulate internal workflows like onboarding, leave approval, and document verification.

[![Built with React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![React Flow](https://img.shields.io/badge/React%20Flow-12-7c3aed)](https://reactflow.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs)

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

## ✨ Features

### Core (Required)
| Feature | Status |
|---|---|
| Drag-and-drop workflow canvas (React Flow) | ✅ |
| 5 node types: Start, Task, Approval, Automated, End | ✅ |
| Node configuration forms per type | ✅ |
| Dynamic action params for Automated nodes (from mock API) | ✅ |
| Mock API: `GET /automations` + `POST /simulate` | ✅ |
| Workflow Sandbox with step-by-step execution log | ✅ |
| Graph validation (cycles, missing start/end, orphan nodes) | ✅ |

### Bonus (Extras implemented)
| Feature | Status |
|---|---|
| **Undo / Redo** (50-step history, Ctrl+Z / Ctrl+Y) | ✅ |
| **Workflow Templates** (Onboarding, Leave Approval, Doc Verification) | ✅ |
| **Post-simulation node highlighting** — nodes get live status badges | ✅ |
| **Validation rings** — error/warning rings on invalid nodes | ✅ |
| **Duplicate node** — one-click clone of any node | ✅ |
| **Export / Import** workflow JSON (Ctrl+E) | ✅ |
| **Editable workflow name** (inline edit in header) | ✅ |
| **Keyboard shortcuts** (Ctrl+Z, Ctrl+Y, Esc, Delete, Ctrl+E) | ✅ |
| **Floating canvas toolbar** with undo/redo + shortcuts cheatsheet | ✅ |
| **Node type breakdown** in header | ✅ |
| **Mini-map** overview | ✅ |

---

## 🗂 Architecture

```
src/
├── api/
│   ├── mockApi.ts          # GET /automations + POST /simulate (topological sim)
│   └── nanoid.ts           # Tiny ID generator
├── components/
│   ├── Header.tsx           # Dark top bar: name edit, undo/redo, export, run
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx  # ReactFlow + drag-drop + keyboard shortcuts
│   │   ├── NodePalette.tsx     # Left sidebar with draggable node cards
│   │   └── FloatingToolbar.tsx # Undo/Redo/Shortcuts hint toolbar
│   ├── forms/
│   │   └── NodeFormPanel.tsx   # All 5 type-specific edit forms
│   ├── nodes/
│   │   ├── NodeWrapper.tsx     # Base card: status overlay, validation rings, actions
│   │   └── index.tsx           # All 5 node components + NODE_TYPES map
│   ├── sandbox/
│   │   └── SandboxPanel.tsx    # Simulation drawer + execution log timeline
│   └── templates/
│       └── TemplateModal.tsx   # Template picker modal with mini previews
├── data/
│   └── templates.ts        # 3 pre-built workflow templates
├── store/
│   └── workflowStore.ts    # Zustand store (nodes, edges, undo/redo, sim status)
├── types/
│   └── workflow.ts         # All TypeScript interfaces
└── utils/
    └── validation.ts       # Client-side structural validation
```

---

## 🎨 Design System

**Color palette** — Deep navy header (`#1c1535`) with lavender canvas (`#f7f6ff`). Each node type has a coordinated pastel tint (CSS variables), making theming a one-line change.

**Fonts** — *Outfit* (geometric, distinctive) for labels and headings; *DM Sans* (warm, readable) for form body text.

**Node status ring system:**
- 🟢 Green ring = completed after simulation
- 🟡 Yellow ring = pending (awaiting manual approval)
- 🔴 Red ring = failed / validation error
- 🟠 Orange ring = validation warning (disconnected node)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected node |
| `Escape` | Deselect node |
| `Ctrl+E` | Export workflow JSON |

---

## 🔌 Extending the Project

### Add a new node type (6 steps)
1. `types/workflow.ts` — Add `NewNodeData` interface
2. `components/nodes/index.tsx` — Add node card component
3. `components/canvas/NodePalette.tsx` — Add palette entry
4. `components/forms/NodeFormPanel.tsx` — Add form + conditional render
5. `store/workflowStore.ts` — Add `getDefaultData()` case
6. `api/mockApi.ts` — Add `postSimulate()` handler case

### Replace mock API with real backend
Swap the two exported functions in `src/api/mockApi.ts` for real `fetch()` calls to your FastAPI/Express backend. No other changes needed.

---

## 🧠 What I'd Add With More Time
- **Auto-layout** (ELK.js or dagre) — auto-arrange nodes on import
- **Node templates** — save/load preset node configurations
- **Real-time collaboration** (Liveblocks / Yjs)
- **Unit tests** (Vitest + React Testing Library)
- **E2E tests** (Cypress / Playwright)
- **Workflow versioning** — history of workflow changes
- **Conditional edges** — branch logic with edge labels
