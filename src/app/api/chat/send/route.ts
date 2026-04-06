import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let body: { contactId?: string; content?: string; tenantId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { contactId, content, tenantId } = body

    if (!contactId || !content || !tenantId) {
      return NextResponse.json(
        { error: 'contactId, content and tenantId are required' },
        { status: 400 },
      )
    }

    // 1. Buscar Tenant com credenciais da Evolution API
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!tenant || !tenant.evolutionApiUrl || !tenant.evolutionApiKey || !tenant.whatsappInstance) {
      return NextResponse.json(
        { error: 'WhatsApp not configured for this tenant' },
        { status: 422 },
      )
    }

    // 2. Buscar telefone do contato
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact || !contact.phone) {
      return NextResponse.json({ error: 'Contact not found or has no phone' }, { status: 404 })
    }

    // 3. Enviar via Evolution API
    const evolutionUrl = `${tenant.evolutionApiUrl}/message/sendText/${tenant.whatsappInstance}`
    let evolutionMessageId: string | null = null

    try {
      const response = await fetch(evolutionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: tenant.evolutionApiKey,
        },
        body: JSON.stringify({
          number: contact.phone,
          text: content,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        evolutionMessageId = result?.key?.id || null
      } else {
        console.error('[chat/send] Evolution API error:', response.status, await response.text())
      }
    } catch (err) {
      console.error('[chat/send] Evolution API fetch failed:', err)
    }

    // 4. Salvar mensagem no banco (mesmo se Evolution falhar, para visibilidade)
    const message = await prisma.message.create({
      data: {
        tenantId,
        contactId,
        content,
        isFromMe: true,
        messageId: evolutionMessageId,
        status: evolutionMessageId ? 'SENT' : 'FAILED',
      },
    })

    return NextResponse.json({
      id: message.id,
      tenantId: message.tenantId,
      contactId: message.contactId,
      content: message.content,
      isFromMe: message.isFromMe,
      messageId: message.messageId,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error('[chat/send] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
