'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/Store'
import { Task } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Props {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskModal({ task, open, onOpenChange }: Props) {
  const { addTask, updateTask, contacts, users, currentUser } = useStore()
  const { toast } = useToast()
  const isEditing = !!task

  const [form, setForm] = useState({
    title: '', description: '', contactId: '', userId: '',
    dueDate: '', trigger: 'MANUAL' as const, status: 'PENDING' as const,
  })

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title, description: task.description,
        contactId: task.contactId || '', userId: task.userId,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        trigger: task.trigger as any, status: task.status as any,
      })
    } else {
      setForm({
        title: '', description: '', contactId: '', userId: currentUser?.id || '',
        dueDate: '', trigger: 'MANUAL', status: 'PENDING',
      })
    }
  }, [task, open, currentUser])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.userId) return
    const payload = { ...form, contactId: form.contactId || undefined }
    const success = isEditing
      ? await updateTask(task!.id, payload as any)
      : await addTask(payload as any)
    if (success) {
      toast({ title: isEditing ? 'Tarefa atualizada' : 'Tarefa criada' })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="O que precisa ser feito?" />
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes..." className="min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Contato (opcional)</Label>
              <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Prazo</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            {isEditing && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="DONE">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditing ? 'Salvar' : 'Criar Tarefa'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
