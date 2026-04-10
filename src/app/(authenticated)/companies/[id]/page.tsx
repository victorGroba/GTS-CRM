'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/store/Store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Building2, Mail, Phone, MapPin, DollarSign, Users, FileText, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { companies, contacts, orders, deals, tickets } = useStore()

  const company = useMemo(() => companies.find((c) => c.id === id), [companies, id])
  const companyContacts = useMemo(() => contacts.filter((c) => c.companyId === id), [contacts, id])
  const companyOrders = useMemo(() => orders.filter((o) => o.companyId === id), [orders, id])
  const companyDeals = useMemo(() => {
    const contactIds = companyContacts.map((c) => c.id)
    return deals.filter((d) => contactIds.includes(d.contactId))
  }, [deals, companyContacts])
  const companyTickets = useMemo(() => {
    const contactIds = companyContacts.map((c) => c.id)
    return tickets.filter((t) => contactIds.includes(t.contactId))
  }, [tickets, companyContacts])

  const totalPaid = companyOrders.filter((o) => o.status === 'PAID').reduce((s, o) => s + o.amount, 0)
  const totalPending = companyOrders.filter((o) => o.status === 'PENDING').reduce((s, o) => s + o.amount, 0)
  const mrr = companyOrders.filter((o) => o.isRecurring && o.status === 'PAID').reduce((s, o) => s + o.amount, 0)
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  if (!company) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Empresa não encontrada</h2>
          <Button variant="outline" onClick={() => router.push('/companies')}>Voltar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-fade-in-up">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.push('/companies')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {company.cnpj && <span>CNPJ: {company.cnpj}</span>}
            {company.segment && <Badge variant="secondary">{company.segment}</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {company.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{company.email}</span>}
            {company.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>}
            {company.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.address}</span>}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Faturado</p>
          <p className="text-xl font-bold text-emerald-600">{fmt(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Pendente</p>
          <p className="text-xl font-bold text-orange-500">{fmt(totalPending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">MRR</p>
          <p className="text-xl font-bold text-primary">{fmt(mrr)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Contatos</p>
          <p className="text-xl font-bold">{companyContacts.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="contacts" className="text-xs"><Users className="h-3.5 w-3.5 mr-1" />Contatos</TabsTrigger>
          <TabsTrigger value="deals" className="text-xs"><DollarSign className="h-3.5 w-3.5 mr-1" />Negócios</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs"><ShoppingCart className="h-3.5 w-3.5 mr-1" />Pedidos</TabsTrigger>
          <TabsTrigger value="tickets" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase">Nome</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyContacts.length > 0 ? companyContacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Link href={`/contacts/${c.id}`} className="font-medium text-sm hover:text-primary">{c.name}</Link></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-20">Nenhum contato vinculado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase">Negócio</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Valor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyDeals.length > 0 ? companyDeals.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-sm">{d.title}</TableCell>
                    <TableCell className="text-sm">{fmt(d.value)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{d.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(d.createdAt), "dd MMM yyyy", { locale: ptBR })}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-20">Nenhum negócio.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase">Descrição</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Valor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Recorrente</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyOrders.length > 0 ? companyOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-sm">{o.description || '-'}</TableCell>
                    <TableCell className="text-sm">{fmt(o.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.status}</Badge></TableCell>
                    <TableCell className="text-sm">{o.isRecurring ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "dd MMM yyyy", { locale: ptBR })}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-20">Nenhum pedido.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase">Assunto</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Contato</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Prioridade</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyTickets.length > 0 ? companyTickets.map((t) => {
                  const contact = contacts.find((c) => c.id === t.contactId)
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium text-sm">{t.subject}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contact?.name || '-'}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{t.priority}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{t.status}</Badge></TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-20">Nenhum ticket.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
