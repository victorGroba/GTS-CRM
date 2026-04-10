import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantName = "Lab Mattos CRM"
  
  // create or find tenant
  let tenant = await prisma.tenant.findFirst({
    where: { name: tenantName }
  })
  
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
      }
    })
    console.log(`Created Tenant: ${tenant.name}`)
  } else {
    console.log(`Tenant already exists: ${tenant.name}`)
  }

  // create or find user
  const userEmail = "ti@labmattos.com.br"
  
  let user = await prisma.user.findUnique({
    where: { email: userEmail }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: "Admin",
        password: "Jvfg2409@",
        role: Role.ADMIN,
        tenantId: tenant.id
      }
    })
    console.log(`Created User: ${user.email}`)
  } else {
    // update password if it exists
    user = await prisma.user.update({
      where: { email: userEmail },
      data: { password: "Jvfg2409@" }
    })
    console.log(`User already exists, updated password: ${user.email}`)
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
