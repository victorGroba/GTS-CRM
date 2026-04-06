import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Deal, DealStatus } from '@/types'
import { useStore } from '@/store/Store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface DealModalProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealModal({ deal, open, onOpenChange }: DealModalProps) {
  const { contacts, users, stages, addDeal, updateDeal, deleteDeal } = useStore()
  const { register, handleSubmit, setValue, reset, watch } = useForm<Partial<Deal>>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (deal) {
      reset(deal)
    } else {
      reset({ status: 'OPEN', value: 0 })
      if (stages.length > 0) setValue('stageId', stages[0].id)
    }
  }, [deal, reset, stages, setValue, open])

  const onSubmit = async (data: Partial<Deal>) => {
    setIsLoading(true)
    try {
      if (deal) {
        const success = await updateDeal(deal.id, data as Partial<Deal>)
        if (success) {
          toast.success('Negócio atualizado com sucesso!')
          onOpenChange(false)
        } else {
          toast.error('Erro ao atualizar no banco de dados.')
        }
      } else {
        if (!data.title || !data.value || !data.contactId || !data.assignedUserId || !data.stageId) {
          toast.error('Preencha todos os campos obrigatórios')
          setIsLoading(false)
          return
        }
        const success = await addDeal(data as Omit<Deal, 'id' | 'createdAt' | 'tenantId'>)
        if (success) {
          toast.success('Novo negócio criado!')
          onOpenChange(false)
        } else {
          toast.error('Erro ao criar negócio no banco de dados.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deal) return
    if (!confirm('Tem certeza que deseja excluir permanentemente este negócio?')) return
    setIsLoading(true)
    try {
      const success = await deleteDeal(deal.id)
      if (success) {
        toast.success('Negócio excluído com sucesso.')
        onOpenChange(false)
      } else {
        toast.error('Erro ao excluir no banco de dados.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{deal ? 'Editar Negócio' : 'Novo Negócio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Negócio *</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="Ex: Licença Anual CRM"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                {...register('value', { valueAsNumber: true, required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(val) => setValue('status', val as DealStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Em Aberto</SelectItem>
                  <SelectItem value="WON">Ganho</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contato *</Label>
            <Select value={watch('contactId')} onValueChange={(val) => setValue('contactId', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contato" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa *</Label>
              <Select value={watch('stageId')} onValueChange={(val) => setValue('stageId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Responsável *</Label>
              <Select
                value={watch('assignedUserId')}
                onValueChange={(val) => setValue('assignedUserId', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 flex !justify-between">
            {deal ? (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={isLoading}>
                Excluir
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
