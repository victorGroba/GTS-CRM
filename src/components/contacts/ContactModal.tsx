import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { useStore } from '@/store/Store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ContactModalProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactModal({ contact, open, onOpenChange }: ContactModalProps) {
  const { addContact, updateContact, deleteContact } = useStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (contact && open) {
      setName(contact.name)
      setEmail(contact.email)
      setPhone(contact.phone || '')
      setCompany(contact.company || '')
    } else if (open) {
      setName('')
      setEmail('')
      setPhone('')
      setCompany('')
    }
  }, [contact, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (contact) {
        const success = await updateContact(contact.id, { name, email, phone, company })
        if (success) {
          toast({ title: 'Contato atualizado', description: 'Os dados foram salvos com sucesso.' })
          onOpenChange(false)
        } else {
          toast({ title: 'Erro', description: 'Falha ao salvar. Tente novamente.', variant: 'destructive' })
        }
      } else {
        const success = await addContact({ name, email, phone, company })
        if (success) {
          toast({ title: 'Contato adicionado', description: 'Um novo contato foi criado.' })
          onOpenChange(false)
        } else {
          toast({ title: 'Erro', description: 'Falha ao criar o contato. Tente novamente.', variant: 'destructive' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contact) return
    if (!confirm('Você tem certeza que deseja excluir esse contato e todo o histórico vinculado a ele?')) return
    
    setIsLoading(true)
    try {
      const res = await deleteContact(contact.id)
      if (res) {
        toast({ title: 'Contato Apgado', description: 'O Contato foi removido.' })
        onOpenChange(false)
      } else {
        toast({ title: 'Erro', description: 'O contato não pôde ser apagado. Database erro.', variant: 'destructive' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{contact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          <DialogDescription>
            {contact
              ? 'Edite as informações do contato selecionado.'
              : 'Preencha os dados abaixo para adicionar um novo lead ou cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@empresa.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nome da empresa"
            />
          </div>
          <DialogFooter className="pt-4 flex !justify-between w-full">
            <div>
              {contact && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : contact ? 'Salvar Alterações' : 'Criar Contato'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
