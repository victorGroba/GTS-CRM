import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })
    }

    // Buscar contatos que possuem mensagens, com a última mensagem
    // Buscar contatos que possuem mensagens, com as mensagens ordenadas
    const contacts = await prisma.contact.findMany({
      where: {
        tenantId,
        messages: { some: {} },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Montar resposta e ordenar por última mensagem (mais recente primeiro)
    const conversations = contacts
      .map((contact) => {
        const lastMessage = contact.messages[0]
        
        // Calcular unread manual para não bugar o Prisma antigo
        const unreadCount = contact.messages.filter(
          (m) => !m.isFromMe && m.status === 'RECEIVED'
        ).length

        return {
          contact: {
            id: contact.id,
            tenantId: contact.tenantId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            createdAt: contact.createdAt.toISOString(),
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                tenantId: lastMessage.tenantId,
                contactId: lastMessage.contactId,
                content: lastMessage.content,
                isFromMe: lastMessage.isFromMe,
                messageId: lastMessage.messageId,
                status: lastMessage.status,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          unreadCount,
        }
      })
      .sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
        return dateB - dateA
      })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('[chat/conversations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
