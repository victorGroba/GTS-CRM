'use server'

import { prisma } from '@/lib/prisma'
import { TaskStatus, TaskTrigger } from '@prisma/client'

export async function addTaskDb(data: any, tenantId: string) {
  try {
    const task = await prisma.task.create({
      data: {
        tenantId,
        contactId: data.contactId || null,
        userId: data.userId,
        title: data.title,
        description: data.description || '',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        trigger: (data.trigger as TaskTrigger) || 'MANUAL',
        status: (data.status as TaskStatus) || 'PENDING',
      },
    })
    return { success: true, data: task }
  } catch (error) {
    console.error('Error adding task:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateTaskDb(id: string, updates: any) {
  try {
    const dataToUpdate = { ...updates }
    if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate)
    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    })
    return { success: true, data: task }
  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteTaskDb(id: string) {
  try {
    await prisma.task.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function generateAutoTasks(tenantId: string) {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const staleContacts = await prisma.contact.findMany({
      where: {
        tenantId,
        updatedAt: { lt: sevenDaysAgo },
        tasks: { none: { trigger: 'LEAD_FRIO', status: { in: ['PENDING', 'IN_PROGRESS'] } } },
      },
      include: { deals: { where: { status: 'OPEN' }, include: { assignee: true } } },
    })

    const tasksCreated = []
    for (const contact of staleContacts) {
      const assignee = contact.deals[0]?.assignee
      if (!assignee) continue

      const task = await prisma.task.create({
        data: {
          tenantId,
          contactId: contact.id,
          userId: assignee.id,
          title: `Follow-up: ${contact.name}`,
          description: `Contato sem interação há mais de 7 dias. Último update: ${contact.updatedAt.toLocaleDateString('pt-BR')}`,
          trigger: 'LEAD_FRIO',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      tasksCreated.push(task)
    }

    return { success: true, data: tasksCreated, count: tasksCreated.length }
  } catch (error) {
    console.error('Error generating auto tasks:', error)
    return { success: false, error: 'Database error' }
  }
}
