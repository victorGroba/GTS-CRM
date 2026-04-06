'use server'

import { prisma } from '@/lib/prisma'

export async function addStageDb(data: { name: string, order: number, color: string }, tenantId: string) {
  try {
    const stage = await prisma.stage.create({
      data: {
        tenantId,
        name: data.name,
        order: data.order,
        color: data.color || 'bg-gray-500',
      },
    })
    return { success: true, data: stage }
  } catch (error) {
    console.error('addStageDb Error:', error)
    return { success: false, error: 'Failed to create stage' }
  }
}

export async function updateStageDb(stageId: string, updates: any) {
  try {
    const data = await prisma.stage.update({
      where: { id: stageId },
      data: updates,
    })
    return { success: true, data }
  } catch (error) {
    console.error('updateStageDb Error:', error)
    return { success: false, error: 'Failed to update stage' }
  }
}

export async function deleteStageDb(stageId: string) {
  try {
    // Stage deletion should cascade to Deals (or we can block if it has Deals, but since we set Cascade, Deals are deleted).
    // In a real CRM, you usually check if Deals exist. We will just delete because it cascades.
    await prisma.stage.delete({
      where: { id: stageId }
    })
    return { success: true }
  } catch (error) {
    console.error('deleteStageDb Error:', error)
    return { success: false, error: 'Database delete failed' }
  }
}
