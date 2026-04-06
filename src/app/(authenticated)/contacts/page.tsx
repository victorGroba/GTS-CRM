'use client'

import { useState } from 'react'
import { useStore } from '@/store/Store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Phone, Mail, Building, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Contact } from '@/types'
import { ContactModal } from '@/components/contacts/ContactModal'
import { useToast } from '@/hooks/use-toast'

export default function ContactsPage() {
  const { contacts, deleteContact } = useStore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNewContact = () => {
    setSelectedContact(null)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleDeleteContact = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o contato ${name}?`)) {
      deleteContact(id)
      toast({
        title: 'Contato Excluído',
        description: `${name} foi removido com sucesso.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Contatos</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gerencie sua carteira de clientes e leads.
          </p>
        </div>
        <Button
          onClick={handleNewContact}
          style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }}
          className="shadow-md shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Contato
        </Button>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por nome, empresa ou email..."
              className="pl-9 h-9 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Nome</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Contato</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Empresa</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Data Cadastro</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <TableRow
                  key={contact.id}
                  className={`hover:bg-primary/[0.02] transition-colors animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}
                >
                  <TableCell className="font-medium text-sm">{contact.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-primary/50" /> {contact.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-primary/50" /> {contact.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <Building className="h-3.5 w-3.5 text-muted-foreground/60" /> {contact.company}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(contact.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ContactModal 
        contact={selectedContact} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  )
}
