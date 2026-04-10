'use server'

import { prisma } from '@/lib/prisma'
import { TicketPriority, TicketStatus } from '@prisma/client'

export async function addTicketDb(data: any, tenantId: string) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        tenantId,
        contactId: data.contactId,
        assignedUserId: data.assignedUserId,
        subject: data.subject,
        description: data.description || '',
        priority: (data.priority as TicketPriority) || 'MEDIUM',
        status: (data.status as TicketStatus) || 'OPEN',
        slaDeadline: data.slaDeadline ? new Date(data.slaDeadline) : null,
      },
    })
    return { success: true, data: ticket }
  } catch (error) {
    console.error('Error adding ticket:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateTicketDb(id: string, updates: any) {
  try {
    const dataToUpdate = { ...updates }
    if (updates.slaDeadline) dataToUpdate.slaDeadline = new Date(updates.slaDeadline)
    if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') {
      dataToUpdate.resolvedAt = new Date()
    }
    const ticket = await prisma.ticket.update({
      where: { id },
      data: dataToUpdate,
    })
    return { success: true, data: ticket }
  } catch (error) {
    console.error('Error updating ticket:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteTicketDb(id: string) {
  try {
    await prisma.ticket.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return { success: false, error: 'Database error' }
  }
}
