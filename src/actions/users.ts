'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function updateUserDb(userId: string, updates: Partial<Prisma.UserUpdateInput>) {
  try {
    const data = await prisma.user.update({
      where: { id: userId },
      data: updates,
    })
    return { success: true, data }
  } catch (error) {
    console.error('updateUserDb Error:', error)
    return { success: false, error: 'Database update failed' }
  }
}

export async function createUserDb(data: any, tenantId: string) {
  try {
    const user = await prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        password: data.password || '123456',
        role: data.role || 'VENDEDOR',
      },
    })
    return { success: true, data: user }
  } catch (error) {
    console.error('createUserDb Error:', error)
    return { success: false, error: 'Database create failed' }
  }
}

export async function deleteUserDb(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    return { success: true }
  } catch (error) {
    console.error('deleteUserDb Error:', error)
    return { success: false, error: 'Database delete failed' }
  }
}
