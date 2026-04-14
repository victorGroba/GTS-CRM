import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('crm_jwt')?.value

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const auth = await verifyToken(token)
  if (!auth) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
  }

  const { userId } = auth

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const tenantId = user.tenantId

    const [users, contacts, stages, deals, notes, companies, interactions, tickets, tasks, orders] =
      await Promise.all([
        prisma.user.findMany({ where: { tenantId } }),
        prisma.contact.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.stage.findMany({ where: { tenantId }, orderBy: { order: 'asc' } }),
        prisma.deal.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.note.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.company.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.interaction.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.ticket.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.task.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
        prisma.order.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      ])

    return NextResponse.json({
      currentUser: user,
      currentTenant: user.tenant,
      users,
      contacts,
      stages,
      deals,
      notes,
      companies,
      interactions,
      tickets,
      tasks,
      orders,
    })
  } catch (error) {
    console.error('Error fetching CRM initial data:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar dados do CRM' }, { status: 500 })
  }
}
