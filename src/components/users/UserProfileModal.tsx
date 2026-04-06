import { useState, useEffect } from 'react'
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

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { currentUser, updateUser } = useStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser && open) {
      setName(currentUser.name)
      setEmail(currentUser.email)
      setAvatarUrl(currentUser.avatarUrl || '')
      setPassword('') // Don't show current password
    }
  }, [currentUser, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setIsLoading(true)

    try {
      const updates: any = { name, email, avatarUrl }
      if (password.trim() !== '') {
        updates.password = password
      }

      const success = await updateUser(currentUser.id, updates)
      if (success) {
        toast({ title: 'Perfil atualizado', description: 'Seus dados foram atualizados com sucesso.' })
        onOpenChange(false)
      } else {
        toast({ title: 'Erro', description: 'Falha ao salvar as alterações.', variant: 'destructive' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>Edite suas informações pessoais de acesso ao sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail de Acesso</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL da Foto (Avatar)</Label>
            <Input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
