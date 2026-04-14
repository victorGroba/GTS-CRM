import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('crm_jwt')?.value
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const auth = await verifyToken(token)
  if (!auth) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

  const { id } = await params
  const { stageId } = await request.json()

  if (!stageId) {
    return NextResponse.json({ error: 'stageId obrigatório' }, { status: 400 })
  }

  try {
    const deal = await prisma.deal.update({
      where: { id },
      data: { stageId },
    })
    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error moving deal:', error)
    return NextResponse.json({ error: 'Erro ao mover negócio' }, { status: 500 })
  }
}
