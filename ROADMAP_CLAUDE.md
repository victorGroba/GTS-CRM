# GrobaTech CRM V2: Enterprise Master Plan & Claude Code Prompts

## 🎯 1. Arquitetura das Novas Funcionalidades B2B (Visão Adapta/Chatwoot)

### 1.1 JourneyFlow (Navegação Espacial do Funil)
- Implementação de um `Canvas UI` com **Zoom e Pan** (usando lib como `reactflow` ou `framer-motion` com transforms) permitindo dar um zoom-out geral no pipeline ou zoom-in em jornadas específicas de clientes.

### 1.2 Visão B2B: Empresas (Companies) 360º
- Criação do Model `Company` (Empresa), atuando como **Pai**. Contatos, Negócios (Deals), Chamadas (Calls) e Tickets todos orbitam a Empresa. Uma janela mostrará o histórico de faturamento para prever "Renovações". 

### 1.3 Sistema Completo de Helpdesk (Tickets)
- Criação do model `Ticket`. O cliente relatou um bug no Zap? Vira um Ticket no painel. Histórico de compras vinculado para dar contexto do SLA. Níveis de prioridade e SLA (ex: "Resolver em 2h").

### 1.4 Central de Controle: Chamadas e Tarefas (Smart To-Do)
- Model `Interaction`: Registro de chamadas (Resumo, Sentimento Positivo/Negativo).
- Sistema de Gatilho de **Tarefas Automáticas**: Se um Contato esfriou por 7 dias, um background job / lógica cria automaticamente uma `Task` priorizada para o vendedor: "Fazer Follow-up".

### 1.5 Faturamento e Ordens de Serviço (Orders)
- Além do "Negócio", o CRM registra as Notas Fiscais/Pedidos confirmados (`Order` model) acompanhando pagamentos via cron, focado na previsibilidade e MRR (Receita Recorrente).

---

## 🚀 2. O Super Prompt para Copiar e Colar no Claude Code

*(Copie o texto gigante do bloco negro abaixo e cole no terminal do Claude Code de uma vez. Ele já mapeia toda a arquitetura que projetamos juntos e orienta a expansão sem quebrar o CRM).*

```markdown
Você é um Arquiteto Fullstack Sênior operando no projeto GTS CRM (Next.js 15, Prisma, Tailwind, Zustand). Sua missão é evoluir nossa base para um ecossistema SAAS massivo inspirado no Chatwoot, Pipedrive e Hubspot (Nível Adapta). Siga as etapas abaixo rigorosamente em ordem:

# PASSO 1: Atualização Massiva do Prisma Schema (Estrutura B2B 360º)
Acesse/Modifique `prisma/schema.prisma` adicionando/ajustando com muito cuidado:
1. **Model Company**: (id, name, cnpj, tenantId, revenue). Adicione `companyId` no model `Contact`. Um contato passa a pertencer a uma Empresa.
2. **Model Interaction/Call**: Para registrar interações complexas (id, type: CALL/WHATSAPP, notes, sentiment, contactId, userId).
3. **Model Ticket**: Sistema de Suporte (id, subject, description, priority, status(OPEN/CLOSED), contactId, assignedUserId).
4. **Model Task & Smart To-Do**: (id, title, dueDate, triggers(ex: 'LEAD_FRIO'), status, contactId, userId).
5. **Model Order**: Para faturamento real além do Deal (id, amount, status: PAID/PENDING, isRecurring, companyId).
6. Execute `npx prisma db push` e `generate`.

# PASSO 2: UI Inovadora - O "JourneyFlow"
Você deve criar a Página `/journey` e seus componentes, utilizando transforms CSS (ou lib leve) permitindo Zoom in/out e Pan (Drag UI). Esse canvas renderizará o KanBan do Pipeline atual no centro, permitindo visualização imersiva do funil e zoom nos cards dos negócios.

# PASSO 3: O Perfil 360º da Empresa e Contato
Atualize fortemente as páginas e componentes de visualização de Contato (`/contacts/[id]`). A tela precisará mostrar Tabs: "Detalhes", "Tickets em Aberto", "Histórico de Calls (Interaction)", e "Pedidos Fechados (Orders)". O mesmo para a entidade "Empresa".

# PASSO 4: Dashboards Avançados e MRR
O Dashboard na Home precisará ler `Orders` e `Deals WON`. Crie APIs que agupem os faturamentos isolando pelo `tenantId`. O Gráfico principal precisará mostrar: "Vendas Diretas vs Recorrência" e "Leads parados aguardando Follow-UP".

# PASSO 5: Tarefas e Inteligência de Follow-Up Automático
Desenvolva a aba lateral "Smart To-Do". Integre regras no Prisma ou cron local onde, se uma data de atualização do Contato for muito antiga, o sistema exalta uma *Task* na tela inicial e no menu em sininho do Assigned User. As Calls salvas devem sugerir qual e quando criar a próxima *Task* proativamente baseando-se no campo "sentimento".
```
