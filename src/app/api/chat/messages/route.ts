import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    const tenantId = searchParams.get('tenantId')
    const after = searchParams.get('after') // ISO timestamp para polling otimizado

    if (!contactId || !tenantId) {
      return NextResponse.json(
        { error: 'contactId and tenantId are required' },
        { status: 400 },
      )
    }

    const where: {
      contactId: string
      tenantId: string
      createdAt?: { gt: Date }
    } = { contactId, tenantId }

    // Se 'after' foi passado, buscar apenas mensagens mais novas
    if (after) {
      where.createdAt = { gt: new Date(after) }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        tenantId: m.tenantId,
        contactId: m.contactId,
        content: m.content,
        isFromMe: m.isFromMe,
        messageId: m.messageId,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
    )
  } catch (error) {
    console.error('[chat/messages] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
