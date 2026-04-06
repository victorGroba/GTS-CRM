import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const incomingLeadSchema = z.object({
  apiToken: z.string().min(1, 'apiToken is required'),
  name: z.string().min(1, 'name is required'),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email'),
  source: z.string().optional().default('webhook'),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    // 2. Validate with Zod
    const parsed = incomingLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { apiToken, name, phone, email, source } = parsed.data

    // 3. Find tenant by apiToken
    const tenant = await prisma.tenant.findUnique({
      where: { apiToken },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid API token' },
        { status: 401 },
      )
    }

    // 4. Find first stage of the tenant's pipeline
    const firstStage = await prisma.stage.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { order: 'asc' },
    })

    if (!firstStage) {
      return NextResponse.json(
        { error: 'Tenant pipeline not configured. No stages found.' },
        { status: 422 },
      )
    }

    // 5. Find default assignee (first ADMIN, fallback to any user)
    const defaultAssignee = await prisma.user.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { role: 'asc' }, // ADMIN comes before VENDEDOR alphabetically
    })

    if (!defaultAssignee) {
      return NextResponse.json(
        { error: 'Tenant has no users configured.' },
        { status: 422 },
      )
    }

    // 6. Upsert contact (find or create by tenantId + email)
    const contact = await prisma.contact.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email,
        },
      },
      update: {
        name,
        phone,
        source,
      },
      create: {
        tenantId: tenant.id,
        name,
        email,
        phone,
        source,
      },
    })

    // 7. Create deal in first stage
    const deal = await prisma.deal.create({
      data: {
        tenantId: tenant.id,
        title: `Lead: ${name}`,
        value: 0,
        stageId: firstStage.id,
        contactId: contact.id,
        assignedUserId: defaultAssignee.id,
        status: 'OPEN',
        source,
      },
    })

    // 8. Return success
    return NextResponse.json(
      {
        message: 'Lead recebido com sucesso',
        contactId: contact.id,
        dealId: deal.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
