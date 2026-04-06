import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 't1' },
    update: {},
    create: {
      id: 't1',
      name: 'Acme Corp',
      apiToken: 'acme-webhook-token-2024',
    },
  })

  // Criar o Super Tenant do Dono do SaaS
  const gtTenant = await prisma.tenant.upsert({
    where: { id: 'grobatech' },
    update: {},
    create: {
      id: 'grobatech',
      name: 'Groba Tech',
      apiToken: 'groba-webhook-token-vip',
    },
  })

  // Users
  await prisma.user.upsert({
    where: { id: 'u1' },
    update: {},
    create: {
      id: 'u1',
      tenantId: 't1',
      name: 'Ana Silva (Admin)',
      email: 'ana@acme.com',
      password: '123456',
      role: 'ADMIN',
      avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    },
  })

  await prisma.user.upsert({
    where: { id: 'u2' },
    update: {},
    create: {
      id: 'u2',
      tenantId: 't1',
      name: 'Carlos Santos',
      email: 'carlos@acme.com',
      password: '123456',
      role: 'VENDEDOR',
      avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    },
  })

  await prisma.user.upsert({
    where: { id: 'u3' },
    update: {},
    create: {
      id: 'u3',
      tenantId: 'grobatech',
      name: 'Equipe Groba',
      email: 'team@grobatech.com',
      password: '123',
      role: 'VENDEDOR',
    },
  })

  // Stages
  const stagesData = [
    { id: 's1', tenantId: 't1', name: 'Prospecção', order: 1, color: 'bg-slate-200' },
    { id: 's2', tenantId: 't1', name: 'Qualificação', order: 2, color: 'bg-blue-100' },
    { id: 's3', tenantId: 't1', name: 'Proposta', order: 3, color: 'bg-indigo-100' },
    { id: 's4', tenantId: 't1', name: 'Negociação', order: 4, color: 'bg-amber-100' },
    { id: 's5', tenantId: 't1', name: 'Fechamento', order: 5, color: 'bg-emerald-100' },
  ]

  for (const stage of stagesData) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {},
      create: stage,
    })
  }

  // Contacts
  const contactsData = [
    {
      id: 'c1',
      tenantId: 't1',
      name: 'João Mendes',
      email: 'joao@clientea.com',
      phone: '11999999999',
      company: 'Cliente A',
    },
    {
      id: 'c2',
      tenantId: 't1',
      name: 'Maria Costa',
      email: 'maria@clienteb.com',
      phone: '11888888888',
      company: 'Cliente B',
    },
    {
      id: 'c3',
      tenantId: 't1',
      name: 'Pedro Lima',
      email: 'pedro@tech.com',
      phone: '11777777777',
      company: 'Tech Solutions',
    },
  ]

  for (const contact of contactsData) {
    await prisma.contact.upsert({
      where: { tenantId_email: { tenantId: contact.tenantId, email: contact.email } },
      update: {},
      create: contact,
    })
  }

  // Deals
  const now = new Date()
  const dealsData = [
    {
      id: 'd1',
      tenantId: 't1',
      title: 'Licenças Enterprise',
      value: 15000,
      stageId: 's3',
      contactId: 'c1',
      assignedUserId: 'u2',
      status: 'OPEN' as const,
    },
    {
      id: 'd2',
      tenantId: 't1',
      title: 'Consultoria de Implantação',
      value: 8500,
      stageId: 's4',
      contactId: 'c2',
      assignedUserId: 'u1',
      status: 'OPEN' as const,
    },
    {
      id: 'd3',
      tenantId: 't1',
      title: 'Upsell Anual',
      value: 32000,
      stageId: 's1',
      contactId: 'c3',
      assignedUserId: 'u2',
      status: 'OPEN' as const,
    },
    {
      id: 'd4',
      tenantId: 't1',
      title: 'Plano Básico',
      value: 1200,
      stageId: 's5',
      contactId: 'c1',
      assignedUserId: 'u1',
      status: 'WON' as const,
    },
    {
      id: 'd5',
      tenantId: 't1',
      title: 'Treinamento Equipe',
      value: 4500,
      stageId: 's2',
      contactId: 'c2',
      assignedUserId: 'u2',
      status: 'OPEN' as const,
    },
  ]

  for (const deal of dealsData) {
    await prisma.deal.upsert({
      where: { id: deal.id },
      update: {},
      create: {
        ...deal,
        expectedCloseDate: new Date(now.getTime() + 30 * 86400000),
      },
    })
  }

  // Notes
  const notesData = [
    {
      id: 'n1',
      tenantId: 't1',
      contactId: 'c1',
      content:
        'Ligação inicial realizada. O cliente demonstrou muito interesse no produto, pediu para enviarmos uma proposta formal.',
    },
    {
      id: 'n2',
      tenantId: 't1',
      contactId: 'c1',
      content: 'Apresentação enviada por e-mail com os valores discutidos.',
    },
    {
      id: 'n3',
      tenantId: 't1',
      contactId: 'c2',
      content: 'Reunião de alinhamento feita. Precisam de um tempo para analisar internamente.',
    },
  ]

  for (const note of notesData) {
    await prisma.note.upsert({
      where: { id: note.id },
      update: {},
      create: note,
    })
  }

  // Usuário Master Grobatech
  await prisma.user.upsert({
    where: { id: 'admin-grobatech' },
    update: {},
    create: {
      id: 'admin-grobatech',
      tenantId: 'grobatech',
      name: 'Victor Groba (CEO)',
      email: 'admin@grobatech.online',
      password: 'Jvfg2409@',
      role: 'ADMIN',
      avatarUrl: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=42',
    },
  })

  console.log('Seed completed successfully!')
  console.log('API Token for Acme Corp:', tenant1.apiToken)
  console.log('API Token for GrobaTech SaaS:', gtTenant.apiToken)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
