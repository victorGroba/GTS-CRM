'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/Store'
import { Company } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyModal({ company, open, onOpenChange }: Props) {
  const { addCompany, updateCompany } = useStore()
  const { toast } = useToast()
  const isEditing = !!company

  const [form, setForm] = useState({
    name: '', cnpj: '', segment: '', revenue: 0, phone: '', email: '', address: '',
  })

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name, cnpj: company.cnpj, segment: company.segment,
        revenue: company.revenue, phone: company.phone, email: company.email, address: company.address,
      })
    } else {
      setForm({ name: '', cnpj: '', segment: '', revenue: 0, phone: '', email: '', address: '' })
    }
  }, [company, open])

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    const success = isEditing
      ? await updateCompany(company!.id, form)
      : await addCompany(form as any)
    if (success) {
      toast({ title: isEditing ? 'Empresa atualizada' : 'Empresa criada' })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da empresa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
            </div>
            <div className="grid gap-2">
              <Label>Segmento</Label>
              <Input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} placeholder="Ex: Tecnologia" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Endereço</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Endereço completo" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditing ? 'Salvar' : 'Criar Empresa'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
