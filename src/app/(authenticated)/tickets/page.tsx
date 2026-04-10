'use client'

import { useState } from 'react'
import { useStore } from '@/store/Store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Ticket } from '@/types'
import { TicketModal } from '@/components/tickets/TicketModal'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusConfig = {
  OPEN: { label: 'Aberto', icon: AlertCircle, className: 'border-orange-200 text-orange-700 bg-orange-50' },
  IN_PROGRESS: { label: 'Em Andamento', icon: Clock, className: 'border-blue-200 text-blue-700 bg-blue-50' },
  RESOLVED: { label: 'Resolvido', icon: CheckCircle2, className: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
  CLOSED: { label: 'Fechado', icon: XCircle, className: 'border-gray-200 text-gray-500 bg-gray-50' },
}

const priorityConfig = {
  LOW: { label: 'Baixa', className: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Média', className: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
}

export default function TicketsPage() {
  const { tickets, contacts, users, deleteTicket } = useStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const filtered = tickets.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    contacts.find((c) => c.id === t.contactId)?.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length

  const handleNew = () => { setSelectedTicket(null); setIsModalOpen(true) }
  const handleEdit = (ticket: Ticket) => { setSelectedTicket(ticket); setIsModalOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Helpdesk - Tickets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {openCount} aberto(s), {inProgressCount} em andamento
          </p>
        </div>
        <Button onClick={handleNew} style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }} className="shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Novo Ticket
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => {
          const config = statusConfig[status]
          const count = tickets.filter((t) => t.status === status).length
          return (
            <Card key={status} className="p-4 flex items-center gap-3">
              <config.icon className="h-8 w-8 text-muted-foreground/60" />
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input placeholder="Buscar tickets..." className="pl-9 h-9 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-white transition-all text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Assunto</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Contato</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Prioridade</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Responsável</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((ticket) => {
              const contact = contacts.find((c) => c.id === ticket.contactId)
              const user = users.find((u) => u.id === ticket.assignedUserId)
              const status = statusConfig[ticket.status]
              const priority = priorityConfig[ticket.priority]
              return (
                <TableRow key={ticket.id} className="hover:bg-primary/[0.02] cursor-pointer" onClick={() => handleEdit(ticket)}>
                  <TableCell className="font-medium text-sm">{ticket.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{contact?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${priority.className}`}>{priority.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${status.className}`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user?.name || '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhum ticket encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <TicketModal ticket={selectedTicket} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
