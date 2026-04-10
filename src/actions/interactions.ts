'use server'

import { prisma } from '@/lib/prisma'
import { InteractionType, Sentiment } from '@prisma/client'

export async function addInteractionDb(data: any, tenantId: string) {
  try {
    const interaction = await prisma.interaction.create({
      data: {
        tenantId,
        contactId: data.contactId,
        userId: data.userId,
        type: data.type as InteractionType,
        notes: data.notes || '',
        sentiment: (data.sentiment as Sentiment) || 'NEUTRAL',
        duration: data.duration || null,
      },
    })
    return { success: true, data: interaction }
  } catch (error) {
    console.error('Error adding interaction:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteInteractionDb(id: string) {
  try {
    await prisma.interaction.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting interaction:', error)
    return { success: false, error: 'Database error' }
  }
}
