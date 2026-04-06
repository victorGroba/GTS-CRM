import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { tenantId, evolutionApiUrl, evolutionApiKey } = await request.json()

    if (!tenantId || !evolutionApiUrl || !evolutionApiKey) {
      return NextResponse.json({ error: 'Faltam dados de conexão' }, { status: 400 })
    }

    // Gerar um nome único para a instância do cliente CRM
    const instanceName = `gtscrm-${tenantId}`

    // 1. Tentar criar a instância e já pedir o QR Code
    const createRes = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    })

    let data = await createRes.json()

    // Indiferente se acabou de criar ou se já existia, SEMPRE chamamos o connect
    // para forçar a engine do Baileys a abrir o WebSockets e gerar um QR novinho!
    const connectRes = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        apikey: evolutionApiKey,
      },
    })
    
    // Sobrescreve os dados para usarmos o retorno limpo do /connect
    data = await connectRes.json()

    // 2. [NOVO] Registrar Webhook para enviar dados para o seu fluxo "GTS CRM" no n8n
    // Troque "NOME_DO_SEU_WEBHOOK" pelo caminho do webhook node no n8n.
    const n8nWebhookUrl = `https://n8n.grobatech.online/webhook/evolution-gts-crm`

    await fetch(`${evolutionApiUrl}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        webhook: {
          url: n8nWebhookUrl,
          byEvents: false,
          base64: false,
          events: [
            "MESSAGES_UPSERT", // Avisar quando chega mensagem nova
            "SEND_MESSAGE"     // Avisar quando envia mensagem
          ]
        }
      })
    }).catch((err) => console.log('Aviso: Erro silencioso ao configurar webhook', err))

    // Salvar as credenciais no banco para este Tenant pro futuro
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        evolutionApiUrl,
        evolutionApiKey,
        whatsappInstance: instanceName,
      },
    })

    if (data?.qrcode?.base64) {
      return NextResponse.json({ base64: data.qrcode.base64, instance: instanceName })
    } else if (data?.base64) {
      return NextResponse.json({ base64: data.base64, instance: instanceName })
    } else if (data?.instance?.state === 'open') {
      // Já está conectado!
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { whatsappConnected: true },
      })
      return NextResponse.json({ alreadyConnected: true })
    } else {
      console.log('Evolution API retornado:', data)
      return NextResponse.json({ error: 'Não foi possível gerar o QR Code. Verifique sua URL e API Key da Evolution, e veja se o servidor deles está de pé.' }, { status: 400 })
    }
  } catch (error) {
    console.error('Evolution Connect falhou:', error)
    return NextResponse.json({ error: 'Falha interna ao tentar se comunicar com o servidor da Evolution API.' }, { status: 500 })
  }
}
