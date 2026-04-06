import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const payload = body as {
      event?: string
      instance?: string
      data?: {
        key?: {
          remoteJid?: string
          fromMe?: boolean
          id?: string
        }
        message?: {
          conversation?: string
          extendedTextMessage?: { text?: string }
        }
        messageTimestamp?: number
      }
    }

    // 1. Validar evento
    if (
      payload.event !== 'messages.upsert' &&
      payload.event !== 'MESSAGES_UPSERT'
    ) {
      return NextResponse.json({ ignored: true, reason: 'event not supported' })
    }

    const instance = payload.instance
    const data = payload.data

    if (!instance || !data?.key) {
      return NextResponse.json({ error: 'Missing instance or data.key' }, { status: 400 })
    }

    // 2. Ignorar mensagens de grupo
    const remoteJid = data.key.remoteJid || ''
    if (remoteJid.includes('@g.us') || remoteJid.includes('@broadcast')) {
      return NextResponse.json({ ignored: true, reason: 'group or broadcast' })
    }

    // 3. Buscar Tenant pela instância
    const tenant = await prisma.tenant.findFirst({
      where: { whatsappInstance: instance },
    })

    if (!tenant) {
      console.error(`[evolution-chat] Tenant not found for instance: ${instance}`)
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // 4. Extrair telefone e ignorar IDs estranhos (@lid) para pegar o telefone real na Evolution (remoteJidAlt)
    const rawRemoteJid = data.key.remoteJid || ''
    // @ts-ignore - Evolution senda remoteJidAlt quando o principal é @lid
    const altJid = data.key.remoteJidAlt || ''
    
    // Se o número principal for o ID esquisito @lid, nós forçamos pegar pelo Alt se ele existir
    const actualJid = rawRemoteJid.includes('@lid') && altJid ? altJid : rawRemoteJid

    const phone = actualJid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@g.us', '')
    if (!phone) {
      return NextResponse.json({ error: 'Invalid remoteJid' }, { status: 400 })
    }

    // 5. Extrair conteúdo da mensagem
    const content =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      '[Mídia]'

    // 6. Idempotência: verificar se messageId já existe
    const messageId = data.key.id || null
    if (messageId) {
      const existing = await prisma.message.findUnique({
        where: { messageId },
      })
      if (existing) {
        return NextResponse.json({ ignored: true, reason: 'duplicate' })
      }
    }

    // 7. Upsert Contact (busca por email placeholder: phone@wa.local)
    const placeholderEmail = `${phone}@wa.local`
    
    // Tentativa de pegar o nome real do WhatsApp (pushName), se não existir usa o telefone
    // @ts-ignore - pushName existe no payload da Evolution API
    const pushName = data.pushName || phone

    const contact = await prisma.contact.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: placeholderEmail,
        },
      },
      update: {
        // Atualizar o nome se o cliente tiver um nome real e antes tava só número
        name: pushName !== phone ? pushName : undefined
      },
      create: {
        tenantId: tenant.id,
        name: pushName,
        email: placeholderEmail,
        phone,
        source: 'whatsapp',
      },
    })

    // 8. Criar mensagem
    const isFromMe = data.key.fromMe ?? false
    const message = await prisma.message.create({
      data: {
        tenantId: tenant.id,
        contactId: contact.id,
        content,
        isFromMe,
        messageId,
        status: isFromMe ? 'SENT' : 'RECEIVED',
      },
    })

    return NextResponse.json({ success: true, messageId: message.id }, { status: 201 })
  } catch (error) {
    console.error('[evolution-chat] Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
