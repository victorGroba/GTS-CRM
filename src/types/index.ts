export type Role = 'ADMIN' | 'VENDEDOR' | 'SUPERADMIN'
export type DealStatus = 'OPEN' | 'WON' | 'LOST'
export type InteractionType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING'
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'
export type TaskTrigger = 'MANUAL' | 'LEAD_FRIO' | 'FOLLOW_UP' | 'POS_VENDA' | 'TICKET_ABERTO'
export type OrderStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface Tenant {
  id: string
  name: string
  whatsappConnected?: boolean
  evolutionApiUrl?: string
  evolutionApiKey?: string
  whatsappInstance?: string
}

export interface User {
  id: string
  tenantId: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
}

export interface Contact {
  id: string
  tenantId: string
  companyId?: string
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
  updatedAt?: string
}

export interface Stage {
  id: string
  tenantId: string
  name: string
  order: number
  color: string
}

export interface Deal {
  id: string
  tenantId: string
  title: string
  value: number
  stageId: string
  contactId: string
  assignedUserId: string
  status: DealStatus
  createdAt: string
  expectedCloseDate?: string
}

export interface Note {
  id: string
  tenantId: string
  contactId: string
  content: string
  createdAt: string
}

export interface Message {
  id: string
  tenantId: string
  contactId: string
  content: string
  isFromMe: boolean
  messageId?: string
  status: string
  createdAt: string
}

export interface Conversation {
  contact: Contact
  lastMessage: Message
  unreadCount: number
}

export interface Company {
  id: string
  tenantId: string
  name: string
  cnpj: string
  segment: string
  revenue: number
  phone: string
  email: string
  address: string
  createdAt: string
  updatedAt?: string
}

export interface Interaction {
  id: string
  tenantId: string
  contactId: string
  userId: string
  type: InteractionType
  notes: string
  sentiment: Sentiment
  duration?: number
  createdAt: string
}

export interface Ticket {
  id: string
  tenantId: string
  contactId: string
  assignedUserId: string
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  slaDeadline?: string
  resolvedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface Task {
  id: string
  tenantId: string
  contactId?: string
  userId: string
  title: string
  description: string
  dueDate?: string
  trigger: TaskTrigger
  status: TaskStatus
  createdAt: string
  updatedAt?: string
}

export interface Order {
  id: string
  tenantId: string
  companyId?: string
  dealId?: string
  description: string
  amount: number
  status: OrderStatus
  isRecurring: boolean
  dueDate?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}
