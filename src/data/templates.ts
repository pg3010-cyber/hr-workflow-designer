import type { WorkflowNode, WorkflowEdge } from '../types/workflow';
import type { MarkerType } from '@xyflow/react';

const E = {
  animated: true,
  style: { stroke: '#c4b5fd', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed' as MarkerType, color: '#c4b5fd' },
};

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  bgColor: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ─── Employee Onboarding ─────────────────────────────────────────
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Full onboarding flow from document collection to account provisioning.',
    category: 'HR Operations',
    emoji: '🎉',
    color: '#16a34a',
    bgColor: '#dcfce7',
    nodes: [
      { id: 't-start', type: 'start', position: { x: 260, y: 40 },
        data: { title: 'Employee Onboarding', metadata: [{ id: 'm1', key: 'department', value: 'Engineering' }] } },
      { id: 't-task1', type: 'task', position: { x: 120, y: 170 },
        data: { title: 'Collect Documents', description: 'Gather ID proof, address and certificates.', assignee: 'HR Team', dueDate: '2025-02-07', customFields: [] } },
      { id: 't-appr1', type: 'approval', position: { x: 400, y: 170 },
        data: { title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
      { id: 't-auto1', type: 'automated', position: { x: 260, y: 320 },
        data: { title: 'Provision Accounts', actionId: 'provision_acc', actionParams: { userId: '', systems: 'GitHub, Slack, Jira' } } },
      { id: 't-task2', type: 'task', position: { x: 100, y: 460 },
        data: { title: 'Conduct Orientation', description: 'Walk through company policies and culture.', assignee: 'L&D Team', dueDate: '', customFields: [] } },
      { id: 't-auto2', type: 'automated', position: { x: 420, y: 460 },
        data: { title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Welcome aboard!', body: '' } } },
      { id: 't-end', type: 'end', position: { x: 260, y: 600 },
        data: { endMessage: 'Onboarding complete! Welcome aboard 🎉', summaryFlag: true } },
    ] as WorkflowNode[],
    edges: [
      { id: 'te1', source: 't-start',  target: 't-task1', ...E },
      { id: 'te2', source: 't-start',  target: 't-appr1', ...E },
      { id: 'te3', source: 't-task1',  target: 't-auto1', ...E },
      { id: 'te4', source: 't-appr1',  target: 't-auto1', ...E },
      { id: 'te5', source: 't-auto1',  target: 't-task2', ...E },
      { id: 'te6', source: 't-auto1',  target: 't-auto2', ...E },
      { id: 'te7', source: 't-task2',  target: 't-end',   ...E },
      { id: 'te8', source: 't-auto2',  target: 't-end',   ...E },
    ],
  },

  // ─── Leave Approval ──────────────────────────────────────────────
  {
    id: 'leave',
    name: 'Leave Approval',
    description: 'Streamlined leave request flow with manager and HRBP sign-offs.',
    category: 'Leave Management',
    emoji: '🏖️',
    color: '#1d4ed8',
    bgColor: '#dbeafe',
    nodes: [
      { id: 'l-start', type: 'start', position: { x: 260, y: 40 },
        data: { title: 'Leave Request', metadata: [{ id: 'm1', key: 'type', value: 'Annual Leave' }] } },
      { id: 'l-task1', type: 'task', position: { x: 260, y: 170 },
        data: { title: 'Submit Leave Form', description: 'Employee submits leave request with dates and reason.', assignee: 'Employee', dueDate: '', customFields: [] } },
      { id: 'l-appr1', type: 'approval', position: { x: 120, y: 320 },
        data: { title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
      { id: 'l-appr2', type: 'approval', position: { x: 400, y: 320 },
        data: { title: 'HRBP Review', approverRole: 'HRBP', autoApproveThreshold: 5 } },
      { id: 'l-auto1', type: 'automated', position: { x: 160, y: 470 },
        data: { title: 'Update HRIS', actionId: 'update_hris', actionParams: { employeeId: '', field: 'leave_balance', value: '' } } },
      { id: 'l-auto2', type: 'automated', position: { x: 380, y: 470 },
        data: { title: 'Notify Employee', actionId: 'send_email', actionParams: { to: '', subject: 'Leave Approved', body: 'Your leave request has been approved.' } } },
      { id: 'l-end', type: 'end', position: { x: 260, y: 610 },
        data: { endMessage: 'Leave approved and recorded. Enjoy your time off!', summaryFlag: false } },
    ] as WorkflowNode[],
    edges: [
      { id: 'le1', source: 'l-start',  target: 'l-task1', ...E },
      { id: 'le2', source: 'l-task1',  target: 'l-appr1', ...E },
      { id: 'le3', source: 'l-task1',  target: 'l-appr2', ...E },
      { id: 'le4', source: 'l-appr1',  target: 'l-auto1', ...E },
      { id: 'le5', source: 'l-appr2',  target: 'l-auto2', ...E },
      { id: 'le6', source: 'l-auto1',  target: 'l-end',   ...E },
      { id: 'le7', source: 'l-auto2',  target: 'l-end',   ...E },
    ],
  },

  // ─── Document Verification ───────────────────────────────────────
  {
    id: 'docverify',
    name: 'Document Verification',
    description: 'Automated document intake, verification, and archival process.',
    category: 'Compliance',
    emoji: '📋',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    nodes: [
      { id: 'd-start', type: 'start', position: { x: 260, y: 40 },
        data: { title: 'Document Verification', metadata: [{ id: 'm1', key: 'compliance', value: 'KYC' }] } },
      { id: 'd-task1', type: 'task', position: { x: 260, y: 170 },
        data: { title: 'Upload Documents', description: 'Applicant uploads required documents.', assignee: 'Applicant', dueDate: '', customFields: [{ id: 'c1', key: 'max_files', value: '5' }] } },
      { id: 'd-auto1', type: 'automated', position: { x: 260, y: 320 },
        data: { title: 'Generate Doc Package', actionId: 'generate_doc', actionParams: { template: 'kyc_bundle', recipient: '' } } },
      { id: 'd-appr1', type: 'approval', position: { x: 120, y: 460 },
        data: { title: 'Legal Review', approverRole: 'Legal', autoApproveThreshold: 0 } },
      { id: 'd-appr2', type: 'approval', position: { x: 400, y: 460 },
        data: { title: 'Director Sign-off', approverRole: 'Director', autoApproveThreshold: 10 } },
      { id: 'd-auto2', type: 'automated', position: { x: 260, y: 610 },
        data: { title: 'Archive & Notify', actionId: 'notify_slack', actionParams: { channel: '#compliance', message: 'Documents verified and archived.' } } },
      { id: 'd-end', type: 'end', position: { x: 260, y: 740 },
        data: { endMessage: 'All documents verified and archived. ✅', summaryFlag: true } },
    ] as WorkflowNode[],
    edges: [
      { id: 'de1', source: 'd-start',  target: 'd-task1',  ...E },
      { id: 'de2', source: 'd-task1',  target: 'd-auto1',  ...E },
      { id: 'de3', source: 'd-auto1',  target: 'd-appr1',  ...E },
      { id: 'de4', source: 'd-auto1',  target: 'd-appr2',  ...E },
      { id: 'de5', source: 'd-appr1',  target: 'd-auto2',  ...E },
      { id: 'de6', source: 'd-appr2',  target: 'd-auto2',  ...E },
      { id: 'de7', source: 'd-auto2',  target: 'd-end',    ...E },
    ],
  },
];
