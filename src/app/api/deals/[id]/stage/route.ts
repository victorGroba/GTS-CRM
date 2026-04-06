import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerStageAutomation } from '@/lib/automation'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { stageId, tenantId, fromStageId } = await request.json()

    if (!stageId || !tenantId || !fromStageId) {
      return NextResponse.json({ error: 'Faltam parâmetros requiridos (stageId, tenantId, fromStageId)' }, { status: 400 })
    }

    const { id } = params

    // Atualiza a etapa do Deal no DB Real (Fase 2)
    // OBS: O seed do DB pode não ter os mesmos IDs mockados do Zustand. 
    // Por isso usamos "ignore" se o deal mock não existir no BD real por enquanto.
    // Assim não quebra o sistema local.
    const deal = await prisma.deal.findUnique({ where: { id } })
    
    if (deal) {
      await prisma.deal.update({
        where: { id },
        data: { stageId },
      })
    } else {
      console.warn(`Deal ${id} not found in real DB yet. This is expected if using local Store IDs. Skipping real update.`)
    }

    // Aciona webhook background
    // Disparo assíncrono para não travar a UI!
    triggerStageAutomation(tenantId, id, fromStageId, stageId).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/deals/[id]/stage:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
