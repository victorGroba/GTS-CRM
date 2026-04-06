'use server'

import { prisma } from '@/lib/prisma'

export async function getSaaSTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' },
          take: 1,
        },
        _count: {
          select: { users: true, deals: true, contacts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: tenants }
  } catch (error) {
    console.error('getSaaSTenants Error:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function createTenantWithAdmin(data: {
  tenantName: string
  adminName: string
  adminEmail: string
  adminPassword?: string
}) {
  try {
    // Basic validation
    if (!data.tenantName || !data.adminName || !data.adminEmail) {
      return { success: false, error: 'Campos obrigatórios ausentes' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    })

    if (existingUser) {
      return { success: false, error: 'E-mail do administrador já está em uso.' }
    }

    // Creating the Tenant and User transactionally
    const newTenant = await prisma.tenant.create({
      data: {
        name: data.tenantName,
        apiToken: `gts-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        users: {
          create: {
            name: data.adminName,
            email: data.adminEmail,
            role: 'ADMIN',
            password: data.adminPassword || '123456', // Default or user-provided
          },
        },
      },
      include: {
        users: true,
      },
    })

    return { success: true, data: newTenant }
  } catch (error) {
    console.error('createTenantWithAdmin Error:', error)
    return { success: false, error: 'Falha ao provisionar novo cliente CRM no servidor.' }
  }
}

export async function deleteTenantById(id: string) {
  try {
    if (!id) return { success: false, error: 'ID is required' }
    
    // Deleting the tenant cascades to Users, Deals, Contacts, Stages, etc.
    await prisma.tenant.delete({
      where: { id }
    })
    
    return { success: true }
  } catch (error) {
    console.error('deleteTenantById Error:', error)
    return { success: false, error: 'Não foi possível excluir o Tenant e seus dados vinculados.' }
  }
}
