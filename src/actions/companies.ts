'use server'

import { prisma } from '@/lib/prisma'

export async function addCompanyDb(data: any, tenantId: string) {
  try {
    const company = await prisma.company.create({
      data: {
        tenantId,
        name: data.name,
        cnpj: data.cnpj || '',
        segment: data.segment || '',
        revenue: data.revenue || 0,
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      },
    })
    return { success: true, data: company }
  } catch (error) {
    console.error('Error adding company:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateCompanyDb(id: string, updates: any) {
  try {
    const company = await prisma.company.update({
      where: { id },
      data: updates,
    })
    return { success: true, data: company }
  } catch (error) {
    console.error('Error updating company:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function deleteCompanyDb(id: string) {
  try {
    await prisma.company.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error('Error deleting company:', error)
    return { success: false, error: 'Database error' }
  }
}
