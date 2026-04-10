'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/store/Store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft, Building2, Mail, Phone, Calendar, MessageSquare, Plus,
  PhoneCall, TicketCheck, ShoppingCart, Clock, SmilePlus
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const sentimentConfig = {
  POSITIVE: { label: 'Positivo', className: 'text-emerald-600 bg-emerald-50', icon: '😊' },
  NEUTRAL: { label: 'Neutro', className: 'text-gray-600 bg-gray-50', icon: '😐' },
  NEGATIVE: { label: 'Negativo', className: 'text-red-600 bg-red-50', icon: '😟' },
}

export default function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { contacts, notes, addNote, interactions, addInteraction, tickets, orders, deals, users, currentUser, companies } = useStore()
  const [newNote, setNewNote] = useState('')
  const [interactionModalOpen, setInteractionModalOpen] = useState(false)
  const [interactionForm, setInteractionForm] = useState({
    type: 'CALL' as string, notes: '', sentiment: 'NEUTRAL' as string, duration: '',
  })

  const contact = useMemo(() => contacts.find((c) => c.id === id), [contacts, id])
  const contactNotes = useMemo(() =>
    notes.filter((n) => n.contactId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes, id]
  )
  const contactInteractions = useMemo(() =>
    interactions.filter((i) => i.contactId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [interactions, id]
  )
  const contactTickets = useMemo(() =>
    tickets.filter((t) => t.contactId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tickets, id]
  )
  const contactDeals = useMemo(() =>
    deals.filter((d) => d.contactId === id),
    [deals, id]
  )
  const contactOrders = useMemo(() => {
    const companyId = contact?.companyId
    return companyId ? orders.filter((o) => o.companyId === companyId) : []
  }, [orders, contact])

  const company = useMemo(() => contact?.companyId ? companies.find((c) => c.id === contact.companyId) : null, [companies, contact])
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Contato não encontrado</h2>
          <Button variant="outline" onClick={() => router.push('/contacts')}>Voltar para contatos</Button>
        </div>
      </div>
    )
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNote({ contactId: contact.id, content: newNote.trim() })
    setNewNote('')
  }

  const handleAddInteraction = async () => {
    if (!interactionForm.notes.trim() || !currentUser) return
    await addInteraction({
      contactId: contact.id,
      userId: currentUser.id,
      type: interactionForm.type as any,
      notes: interactionForm.notes,
      sentiment: interactionForm.sentiment as any,
      duration: interactionForm.duration ? parseInt(interactionForm.duration) : undefined,
    })
    setInteractionForm({ type: 'CALL', notes: '', sentiment: 'NEUTRAL', duration: '' })
    setInteractionModalOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-fade-in-up">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.push('/contacts')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Sidebar - Contact Info */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="text-center pb-4">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-sm">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-medium">
                  {contact.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{contact.company}</p>
              {company && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  <Building2 className="h-3 w-3 mr-1" />{company.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span>Cadastrado em {format(new Date(contact.createdAt), 'dd MMM, yyyy', { locale: ptBR })}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{contactDeals.length}</p>
                  <p className="text-[10px] text-muted-foreground">Negócios</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{contactTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}</p>
                  <p className="text-[10px] text-muted-foreground">Tickets abertos</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{contactInteractions.length}</p>
                  <p className="text-[10px] text-muted-foreground">Interações</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{fmt(contactDeals.filter((d) => d.status === 'WON').reduce((s, d) => s + d.value, 0))}</p>
                  <p className="text-[10px] text-muted-foreground">Ganho</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="outline" size="sm">Editar</Button>
                <Button className="flex-1" size="sm" onClick={() => setInteractionModalOpen(true)}>
                  <PhoneCall className="h-3.5 w-3.5 mr-1" /> Registrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main area with Tabs */}
        <div className="lg:col-span-7 space-y-6">
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="timeline" className="text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Timeline</TabsTrigger>
              <TabsTrigger value="interactions" className="text-xs"><PhoneCall className="h-3.5 w-3.5 mr-1" />Interações</TabsTrigger>
              <TabsTrigger value="tickets" className="text-xs"><TicketCheck className="h-3.5 w-3.5 mr-1" />Tickets</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs"><ShoppingCart className="h-3.5 w-3.5 mr-1" />Pedidos</TabsTrigger>
            </TabsList>

            {/* Tab: Timeline (Notes) */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Nova Nota
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Registre resumos de reuniões, ligações ou informações importantes..."
                      value={newNote} onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[100px] resize-y bg-muted/30 focus-visible:bg-background"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>Salvar Nota</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {contactNotes.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-4 text-muted" />
                    <p>Nenhuma nota registrada.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-border/60">
                  {contactNotes.map((note) => (
                    <div key={note.id} className="relative flex gap-5 animate-fade-in-up">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary/20 text-primary shrink-0 z-10 shadow-sm">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow border-border/50">
                        <CardContent className="p-5">
                          <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            {format(new Date(note.createdAt), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed mt-3">{note.content}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Interactions */}
            <TabsContent value="interactions" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setInteractionModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Nova Interação
                </Button>
              </div>
              {contactInteractions.length > 0 ? (
                <div className="space-y-3">
                  {contactInteractions.map((interaction) => {
                    const user = users.find((u) => u.id === interaction.userId)
                    const sentiment = sentimentConfig[interaction.sentiment]
                    return (
                      <Card key={interaction.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{interaction.type}</Badge>
                            <Badge variant="outline" className={`text-[10px] ${sentiment.className}`}>
                              {sentiment.icon} {sentiment.label}
                            </Badge>
                            {interaction.duration && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{interaction.duration}min
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(interaction.createdAt), "dd MMM yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{interaction.notes}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">por {user?.name || '-'}</p>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center text-muted-foreground bg-muted/30 border-dashed">
                  <PhoneCall className="h-12 w-12 mx-auto mb-3 text-muted" />
                  <p>Nenhuma interação registrada.</p>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Tickets */}
            <TabsContent value="tickets">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase">Assunto</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Prioridade</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactTickets.length > 0 ? contactTickets.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-sm">{t.subject}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{t.priority}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{t.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(t.createdAt), "dd MMM yyyy", { locale: ptBR })}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-20">Nenhum ticket.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tab: Orders */}
            <TabsContent value="orders">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold uppercase">Descrição</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Valor</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase">Recorrente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactOrders.length > 0 ? contactOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium text-sm">{o.description || '-'}</TableCell>
                        <TableCell className="text-sm">{fmt(o.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{o.status}</Badge></TableCell>
                        <TableCell className="text-sm">{o.isRecurring ? 'Sim' : 'Não'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-20">Nenhum pedido vinculado.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Interaction Modal */}
      <Dialog open={interactionModalOpen} onOpenChange={setInteractionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><SmilePlus className="h-5 w-5" /> Registrar Interação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={interactionForm.type} onValueChange={(v) => setInteractionForm({ ...interactionForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Ligação</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Reunião</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Sentimento</Label>
                <Select value={interactionForm.sentiment} onValueChange={(v) => setInteractionForm({ ...interactionForm, sentiment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">😊 Positivo</SelectItem>
                    <SelectItem value="NEUTRAL">😐 Neutro</SelectItem>
                    <SelectItem value="NEGATIVE">😟 Negativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Duração (min)</Label>
              <Input type="number" placeholder="Ex: 15" value={interactionForm.duration} onChange={(e) => setInteractionForm({ ...interactionForm, duration: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Resumo</Label>
              <Textarea placeholder="O que foi conversado..." value={interactionForm.notes} onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })} className="min-h-[80px]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInteractionModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddInteraction} disabled={!interactionForm.notes.trim()}>Registrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
