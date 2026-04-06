const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.findMany();
  console.log("TENANTS:", tenants.map(t => ({ id: t.id, whatsappInstance: t.whatsappInstance })));
  
  if (tenants.length > 0) {
    const tenant = tenants[tenants.length - 1]; // get latest
    console.log("Simulating webhook for instance:", tenant.whatsappInstance);
    
    const payload = {
      event: "messages.upsert",
      instance: tenant.whatsappInstance || `gtscrm-${tenant.id}`,
      data: {
        key: {
          remoteJid: "5511999887766@s.whatsapp.net",
          fromMe: false,
          id: "MSG_TESTE_LOCAL"
        },
        message: {
          conversation: "Olá! Testando o Webhook localmente sem N8N!"
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
      }
    };

    const res = await fetch('http://localhost:3000/api/webhooks/evolution-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log("RESPONSE HTTP:", res.status);
    const text = await res.text();
    console.log("RESPONSE BODY:", text);
  }
}

run().finally(() => process.exit(0));
