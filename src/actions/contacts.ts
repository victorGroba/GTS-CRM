'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addContactDb(data: any, tenantId: string) {
  try {
    const contact = await prisma.contact.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        source: data.source || null,
      },
    })
    
    return { success: true, data: contact }
  } catch (error) {
    console.error('Error adding contact:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateContactDb(id: string, updates: any) {
  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: updates,
    })
    
    return { success: true, data: contact }
  } catch (error) {
    console.error('Error updating contact:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteContactDb(id: string) {
  try {
    await prisma.contact.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return { success: false, error: 'Database error' }
  }
}
