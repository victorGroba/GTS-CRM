'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Plus, ArrowRight, User as UserIcon, Trash2 } from 'lucide-react'
import { getSaaSTenants, createTenantWithAdmin, deleteTenantById } from '@/actions/superadmin'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function SaaSAdminPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Modal State
  const [tenantName, setTenantName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('123456')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const loadTenants = async () => {
    setLoading(true)
    const res = await getSaaSTenants()
    if (res.success && res.data) {
      setTenants(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const res = await createTenantWithAdmin({ tenantName, adminName, adminEmail, adminPassword })
    if (res.success) {
      toast({ title: 'Instância Criada', description: `O CRM para ${tenantName} já está online!` })
      setModalOpen(false)
      loadTenants() // Refresh
      // reset forms
      setTenantName('')
      setAdminName('')
      setAdminEmail('')
    } else {
      toast({ title: 'Erro', description: res.error || 'Erro ao criar', variant: 'destructive' })
    }
    setIsSubmitting(false)
  }

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Tem certeza absoluta? ISSO APAGARÁ PERMANENTEMENTE A EMPRESA ${name} E TODOS OS SEUS DADOS (Contatos, Negócios, Usuários)!`)) {
      return
    }
    
    setLoading(true)
    const res = await deleteTenantById(id)
    if (res.success) {
      toast({ title: 'Empresa Excluída', description: `${name} foi apagado do banco de dados.` })
      loadTenants() // Refresh
    } else {
      toast({ title: 'Erro', description: res.error, variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciador Master SaaS</h1>
          <p className="text-muted-foreground mt-1">Visão geral dos perfis de empresas utilizando o Lab Mattos CRM.</p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20 gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Nova Instância (Cliente)
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando carteira de empresas SaaS...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((t) => (
            <Card key={t.id} className="group hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-default">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{t.name}</CardTitle>
                      <CardDescription className="text-xs uppercase font-medium mt-1">Tenant ID: {t.id.slice(0, 8)}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                    onClick={() => handleDeleteTenant(t.id, t.name)}
                    title="Excluir Empresa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-background border border-border/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Conta Administrador</span>
                  </div>
                  {t.users && t.users.length > 0 ? (
                    <div className="text-sm">
                      <p>{t.users[0].name}</p>
                      <p className="text-xs text-muted-foreground">{t.users[0].email}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem admin</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center text-sm pt-2">
                  <div className="bg-muted rounded p-2 flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Vendedores</span>
                    <span className="font-bold text-lg">{t._count.users}</span>
                  </div>
                  <div className="bg-muted rounded p-2 flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Leads Ativos</span>
                    <span className="font-bold text-lg">{t._count.deals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Provisionar Novo CRM</DialogTitle>
            <DialogDescription>
              Crie uma nova empresa (Tenant) e seu usuário mestre. A instância entra no ar na hora.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome da Empresa (SaaS Tenant)</Label>
              <Input placeholder="Ex: Panificadora XYZ" required value={tenantName} onChange={e => setTenantName(e.target.value)} />
            </div>
            
            <div className="pt-4 pb-2 border-t border-border/40">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" /> Conta do Gestor do Inquilino
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Organizador</Label>
                  <Input placeholder="Ex: Roberto Gerente" required value={adminName} onChange={e => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Acesso (Login)</Label>
                  <Input type="email" placeholder="roberto@xyz.com.br" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Senha Temporária</Label>
                  <Input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Gerando Nuvem...' : 'Cadastrar e Liberar CRM'} <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
