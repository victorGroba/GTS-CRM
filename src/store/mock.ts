import { Contact, Deal, Note, Stage, Tenant, User } from '../types'

export const mockTenants: Tenant[] = [
  { id: 't1', name: 'Acme Corp' },
  { id: 't2', name: 'Stark Industries' },
]

export const mockUsers: User[] = [
  {
    id: 'u1',
    tenantId: 't1',
    name: 'Ana Silva (Admin)',
    email: 'ana@acme.com',
    role: 'ADMIN',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  },
  {
    id: 'u2',
    tenantId: 't1',
    name: 'Carlos Santos',
    email: 'carlos@acme.com',
    role: 'VENDEDOR',
    avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  { id: 'u3', tenantId: 't2', name: 'Tony Stark', email: 'tony@stark.com', role: 'ADMIN' },
]

export const mockContacts: Contact[] = [
  {
    id: 'c1',
    tenantId: 't1',
    name: 'João Mendes',
    email: 'joao@clientea.com',
    phone: '11999999999',
    company: 'Cliente A',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    tenantId: 't1',
    name: 'Maria Costa',
    email: 'maria@clienteb.com',
    phone: '11888888888',
    company: 'Cliente B',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    tenantId: 't1',
    name: 'Pedro Lima',
    email: 'pedro@tech.com',
    phone: '11777777777',
    company: 'Tech Solutions',
    createdAt: new Date().toISOString(),
  },
]

export const mockStages: Stage[] = [
  { id: 's1', tenantId: 't1', name: 'Prospecção', order: 1, color: 'bg-slate-200' },
  { id: 's2', tenantId: 't1', name: 'Qualificação', order: 2, color: 'bg-blue-100' },
  { id: 's3', tenantId: 't1', name: 'Proposta', order: 3, color: 'bg-indigo-100' },
  { id: 's4', tenantId: 't1', name: 'Negociação', order: 4, color: 'bg-amber-100' },
  { id: 's5', tenantId: 't1', name: 'Fechamento', order: 5, color: 'bg-emerald-100' },
]

export const mockDeals: Deal[] = [
  {
    id: 'd1',
    tenantId: 't1',
    title: 'Licenças Enterprise',
    value: 15000,
    stageId: 's3',
    contactId: 'c1',
    assignedUserId: 'u2',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    tenantId: 't1',
    title: 'Consultoria de Implantação',
    value: 8500,
    stageId: 's4',
    contactId: 'c2',
    assignedUserId: 'u1',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd3',
    tenantId: 't1',
    title: 'Upsell Anual',
    value: 32000,
    stageId: 's1',
    contactId: 'c3',
    assignedUserId: 'u2',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd4',
    tenantId: 't1',
    title: 'Plano Básico',
    value: 1200,
    stageId: 's5',
    contactId: 'c1',
    assignedUserId: 'u1',
    status: 'WON',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'd5',
    tenantId: 't1',
    title: 'Treinamento Equipe',
    value: 4500,
    stageId: 's2',
    contactId: 'c2',
    assignedUserId: 'u2',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

export const mockNotes: Note[] = [
  {
    id: 'n1',
    tenantId: 't1',
    contactId: 'c1',
    content:
      'Ligação inicial realizada. O cliente demonstrou muito interesse no produto, pediu para enviarmos uma proposta formal.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'n2',
    tenantId: 't1',
    contactId: 'c1',
    content: 'Apresentação enviada por e-mail com os valores discutidos.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    tenantId: 't1',
    contactId: 'c2',
    content: 'Reunião de alinhamento feita. Precisam de um tempo para analisar internamente.',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
]
