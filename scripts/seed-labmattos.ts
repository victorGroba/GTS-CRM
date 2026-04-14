import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const tenantName = "Lab Mattos CRM"

  let tenant = await prisma.tenant.findFirst({
    where: { name: tenantName }
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
      }
    })
    console.log(`Tenant criado: ${tenant.name}`)
  } else {
    console.log(`Tenant já existe: ${tenant.name}`)
  }

  const userEmail = "ti@labmattos.com.br"
  const rawPassword = "Jvfg2409@"
  const hashedPassword = await bcrypt.hash(rawPassword, 12)

  let user = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: "Admin",
        password: hashedPassword,
        role: Role.ADMIN,
        tenantId: tenant.id
      }
    })
    console.log(`Usuário criado: ${user.email}`)
  } else {
    user = await prisma.user.update({
      where: { email: userEmail },
      data: { password: hashedPassword }
    })
    console.log(`Senha do usuário atualizada (hash): ${user.email}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
