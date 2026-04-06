import { prisma } from './prisma'

interface WebhookPayload {
  event: string
  deal: { id: string; title: string; value: number; status: string }
  contact: { name: string; email: string; phone: string }
  from_stage: string
  to_stage: string
  tenant: string
}

export async function triggerStageAutomation(
  tenantId: string,
  dealId: string,
  fromStageId: string,
  toStageId: string
) {
  try {
    console.log(`Buscando automações para mudanca de etapa... tenant: ${tenantId}, toStage: ${toStageId}`)
    
    // Verifica se a etapa de destino tem alguma automação ativa
    const automation = await prisma.stageAutomation.findUnique({
      where: { stageId: toStageId },
    })

    if (!automation || !automation.isActive || !automation.webhookUrl) {
      console.log('Nenhuma automação ativa ou URL configurada para esta etapa.')
      return
    }

    // Busca dados complementares para montar o payload
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { contact: true, tenant: true },
    })
    
    const fromStage = await prisma.stage.findUnique({ where: { id: fromStageId } })
    const toStage = await prisma.stage.findUnique({ where: { id: toStageId } })

    if (!deal || !toStage) return

    const payload: WebhookPayload = {
      event: 'deal.stage_changed',
      deal: {
        id: deal.id,
        title: deal.title,
        value: deal.value,
        status: deal.status,
      },
      contact: {
        name: deal.contact.name,
        email: deal.contact.email,
        phone: deal.contact.phone,
      },
      from_stage: fromStage?.name || 'Desconhecido',
      to_stage: toStage.name,
      tenant: deal.tenant.name,
    }

    console.log(`Disparando Webhook para ${automation.webhookUrl}...`, payload)

    // Disparo fetch (assíncrono no edge container, idealmente em bg queue, mas serve pro momento)
    const response = await fetch(automation.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Falha no webhook externo', response.statusText)
    } else {
      console.log('Webhook entregue com sucesso!')
    }
  } catch (error) {
    console.error('Erro na automação do webhook:', error)
  }
}
