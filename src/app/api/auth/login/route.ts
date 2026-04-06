import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (password && user.password !== password) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    // Auth Simplificada: Confirma que o user existe e retorna IDs de Sessão
    return NextResponse.json({ id: user.id, tenantId: user.tenantId, role: user.role })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
