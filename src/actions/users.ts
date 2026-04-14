'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function updateUserDb(userId: string, updates: Partial<Prisma.UserUpdateInput>) {
  try {
    // Se a atualização inclui senha, hashear antes de salvar
    if (typeof updates.password === 'string' && updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12)
    }
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
    const rawPassword = data.password || '123456'
    const hashedPassword = await bcrypt.hash(rawPassword, 12)

    const user = await prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
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
