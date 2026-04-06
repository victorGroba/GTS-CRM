import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if tenant exists
  let tenant = await prisma.tenant.findFirst({ where: { name: 'Groba Tech' } })
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Groba Tech',
      }
    })
  }

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email: 'admin@grobatech.com' },
    update: {
      password: 'Jvfg2409@',
      role: 'SUPERADMIN'
    },
    create: {
      email: 'admin@grobatech.com',
      name: 'GrobaTech Admin',
      password: 'Jvfg2409@',
      role: 'SUPERADMIN',
      tenantId: tenant.id
    }
  })

  console.log('✅ Usuário admin@grobatech.com criado com sucesso!', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
