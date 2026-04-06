export type Role = 'ADMIN' | 'VENDEDOR' | 'SUPERADMIN'
export type DealStatus = 'OPEN' | 'WON' | 'LOST'

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
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
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
