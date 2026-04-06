import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Faltam parâmetros requiridos (userId)' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const tenantId = user.tenantId

    // Fetch all tenant data concurrently for maximum speed
    const [users, contacts, stages, deals, notes] = await Promise.all([
      prisma.user.findMany({ where: { tenantId } }),
      prisma.contact.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      prisma.stage.findMany({ where: { tenantId }, orderBy: { order: 'asc' } }),
      prisma.deal.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      prisma.note.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
    ])

    return NextResponse.json({
      currentUser: user,
      currentTenant: user.tenant,
      users,
      contacts,
      stages,
      deals,
      notes,
    })
  } catch (error) {
    console.error('Error fetching CRM initial data:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar dados do CRM' }, { status: 500 })
  }
}
