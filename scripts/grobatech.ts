import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  let tenant = await prisma.tenant.findFirst({ where: { name: 'Groba Tech' } })
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: 'Groba Tech' }
    })
  }

  const hashedPassword = await bcrypt.hash('Jvfg2409@', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@grobatech.com' },
    update: {
      password: hashedPassword,
      role: 'SUPERADMIN'
    },
    create: {
      email: 'admin@grobatech.com',
      name: 'GrobaTech Admin',
      password: hashedPassword,
      role: 'SUPERADMIN',
      tenantId: tenant.id
    }
  })

  console.log('✅ SUPERADMIN criado:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
