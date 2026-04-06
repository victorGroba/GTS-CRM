'use server'

import { prisma } from '@/lib/prisma'
import { DealStatus } from '@prisma/client'

export async function addDealDb(data: any, tenantId: string) {
  try {
    const deal = await prisma.deal.create({
      data: {
        tenantId,
        title: data.title,
        value: data.value,
        stageId: data.stageId,
        contactId: data.contactId,
        assignedUserId: data.assignedUserId,
        status: data.status as DealStatus,
        source: data.source || null,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
      },
    })
    
    return { success: true, data: deal }
  } catch (error) {
    console.error('Error adding deal:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateDealDb(id: string, updates: any) {
  try {
    // Treat expectedCloseDate separately due to date parsing if string check
    const dataToUpdate = { ...updates }
    if (updates.expectedCloseDate) {
      dataToUpdate.expectedCloseDate = new Date(updates.expectedCloseDate)
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: dataToUpdate,
    })
    
    return { success: true, data: deal }
  } catch (error) {
    console.error('Error updating deal:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteDealDb(id: string) {
  try {
    await prisma.deal.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting deal:', error)
    return { success: false, error: 'Database error' }
  }
}
