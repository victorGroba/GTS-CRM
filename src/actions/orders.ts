'use server'

import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function addOrderDb(data: any, tenantId: string) {
  try {
    const order = await prisma.order.create({
      data: {
        tenantId,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        description: data.description || '',
        amount: data.amount,
        status: (data.status as OrderStatus) || 'PENDING',
        isRecurring: data.isRecurring || false,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })
    return { success: true, data: order }
  } catch (error) {
    console.error('Error adding order:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateOrderDb(id: string, updates: any) {
  try {
    const dataToUpdate = { ...updates }
    if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate)
    if (updates.paidAt) dataToUpdate.paidAt = new Date(updates.paidAt)
    if (updates.status === 'PAID' && !updates.paidAt) {
      dataToUpdate.paidAt = new Date()
    }
    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    })
    return { success: true, data: order }
  } catch (error) {
    console.error('Error updating order:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteOrderDb(id: string) {
  try {
    await prisma.order.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    return { success: false, error: 'Database error' }
  }
}
