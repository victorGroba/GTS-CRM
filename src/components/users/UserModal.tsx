'use client'

import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/Store'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/types'

interface UserModalProps {
  user?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserModal({ user, open, onOpenChange }: UserModalProps) {
  const { addUser, updateUser, deleteUser } = useStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'VENDEDOR'>('VENDEDOR')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPassword('') // Don't pre-fill password for security
      setRole(user.role as 'ADMIN' | 'VENDEDOR')
    } else {
      setName('')
      setEmail('')
      setPassword('')
      setRole('VENDEDOR')
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || (!user && !password)) {
      toast({ title: 'Atenção', description: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      if (user) {
        // Edit mode
        const updates: any = { name, email, role }
        if (password) updates.password = password // Only update if typed
        
        const success = await updateUser(user.id, updates)
        if (success) {
          toast({ title: 'Sucesso', description: 'Usuário atualizado.' })
          onOpenChange(false)
        } else {
          toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
        }
      } else {
        // Create mode
        const success = await addUser({ name, email, password, role })
        if (success) {
          toast({ title: 'Criado', description: 'Usuário convidado para a equipe.' })
          onOpenChange(false)
        } else {
          toast({ title: 'Erro', description: 'O e-mail pode já estar em uso.', variant: 'destructive' })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm(`Tem certeza que deseja bloquear e excluir o acesso do usuário ${user.name}?`)) return
    
    setIsLoading(true)
    try {
      const success = await deleteUser(user.id)
      if (success) {
        toast({ title: 'Usuário Excluído', description: 'Acesso revogado.', variant: 'destructive' })
        onOpenChange(false)
      } else {
        toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Membro da Equipe'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de Acesso</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{user ? 'Nova Senha (opcional)' : 'Senha'}</Label>
            <Input 
               id="password" 
               type="password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               disabled={isLoading} 
               placeholder={user ? 'Deixe em branco para não alterar' : '********'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Nível de Permissão</Label>
            <Select value={role} onValueChange={(val: 'ADMIN' | 'VENDEDOR') => setRole(val)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VENDEDOR">Vendedor (Básico)</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4 flex !justify-between w-full">
            <div>
              {user && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
                  Excluir Acesso
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : user ? 'Salvar Alterações' : 'Convidar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
