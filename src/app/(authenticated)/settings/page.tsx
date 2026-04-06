'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/Store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserModal } from '@/components/users/UserModal'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { currentTenant, users, stages, addStage, updateStage, deleteStage } = useStore()
  const { toast } = useToast()

  // Evolution API States
  const [evoUrl, setEvoUrl] = useState('')
  const [evoKey, setEvoKey] = useState('')
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [loadingQr, setLoadingQr] = useState(false)
  
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleConnectWhatsapp = async () => {
    if (!evoUrl || !evoKey) {
      toast({ title: 'Atenção', description: 'Preencha a URL e a API Key da Evolution API.', variant: 'destructive' })
      return
    }
    setLoadingQr(true)
    setQrModalOpen(true)
    setQrCodeData(null)

    try {
      const res = await fetch('/api/evolution/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant?.id,
          evolutionApiUrl: evoUrl,
          evolutionApiKey: evoKey,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        if (data.alreadyConnected) {
          toast({ title: 'Sucesso', description: 'Esta instância já estava com o WhatsApp conectado e online na Evolution API!' })
          setQrModalOpen(false)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else if (data.base64) {
          setQrCodeData(data.base64)
          toast({ title: 'Leia o QR Code', description: 'Abra o WhatsApp em seu celular (Aparelhos Conectados) e escaneie o código.' })
        }
      } else {
        toast({ title: 'Erro Evolution', description: data.error, variant: 'destructive' })
        setQrModalOpen(false)
      }
    } catch (e) {
      toast({ title: 'Erro de Requisição', description: 'Não foi possível contatar o servidor local.', variant: 'destructive' })
      setQrModalOpen(false)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleCreateStage = async () => {
    const newOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 1
    const res = await addStage({ name: 'Nova Etapa', order: newOrder, color: 'bg-gray-500' })
    if (res) toast({ title: 'Etapa Criada', description: 'Uma nova etapa foi adicionada.' })
  }

  const handleUpdateStageName = async (id: string, name: string) => {
    if (!name.trim()) return
    await updateStage(id, { name })
  }

  const handleDeleteStage = async (id: string, name: string) => {
    if (!confirm(`Excluir a etapa ${name}? Todos os negócios nela serão afetados!`)) return
    const res = await deleteStage(id)
    if (res) toast({ title: 'Etapa Removida', description: 'A etapa foi excluída com sucesso.' })
    else toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' })
  }

  if (!isMounted) return null

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Ajuste as preferências da sua conta e da equipe.
        </p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-4 bg-muted/60 p-1">
          <TabsTrigger value="geral" className="text-sm data-[state=active]:shadow-sm">Geral</TabsTrigger>
          <TabsTrigger value="usuarios" className="text-sm data-[state=active]:shadow-sm">Equipe e Usuários</TabsTrigger>
          <TabsTrigger value="funil" className="text-sm data-[state=active]:shadow-sm">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="integracoes" className="text-sm data-[state=active]:shadow-sm text-primary font-medium">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="animate-fade-in-up">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Perfil da Empresa</CardTitle>
              <CardDescription className="text-xs">Informações básicas da sua conta tenant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="companyName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nome da Empresa
                </Label>
                <Input
                  id="companyName"
                  defaultValue={currentTenant?.name}
                  className="h-10 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                />
              </div>
              <Button
                style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }}
                className="shadow-md shadow-primary/20"
              >
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="animate-fade-in-up">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Usuários</CardTitle>
                <CardDescription className="text-xs">Gerencie quem tem acesso ao CRM.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setSelectedUser(null)
                  setUserModalOpen(true)
                }}
              >
                Adicionar Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Nome</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Email</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Papel</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-primary/[0.02] transition-colors">
                      <TableCell className="font-medium text-sm">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px] font-medium',
                            u.role === 'ADMIN'
                              ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                              : ''
                          )}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser((u as unknown) as User)
                            setUserModalOpen(true)
                          }}
                          className="text-xs text-primary bg-primary/10 hover:bg-primary/20 h-7"
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <UserModal 
            user={selectedUser} 
            open={userModalOpen} 
            onOpenChange={setUserModalOpen} 
          />
        </TabsContent>

        <TabsContent value="funil" className="animate-fade-in-up">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Etapas do Funil</CardTitle>
              <CardDescription className="text-xs">
                Defina as fases que compõem o seu processo comercial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-4 p-3.5 border border-border/50 rounded-lg bg-white/60 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="h-7 w-7 rounded-md flex items-center justify-center bg-muted/60 text-xs font-semibold text-muted-foreground">
                      {stage.order}
                    </div>
                    <div className="flex-1">
                      <Input
                        defaultValue={stage.name}
                        onBlur={(e) => handleUpdateStageName(stage.id, e.target.value)}
                        className="h-8 max-w-xs bg-transparent border-transparent hover:border-border focus:border-primary/20 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div
                        className={cn('w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-white mr-2', stage.color)}
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteStage(stage.id, stage.name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4" variant="secondary" size="sm" onClick={handleCreateStage}>
                Adicionar Etapa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="animate-fade-in-up">
          <Card className="shadow-sm border-border/50 bg-gradient-to-br from-white to-primary/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </span>
                Webhooks / Gatilhos Externos (Evolution API)
              </CardTitle>
              <CardDescription className="text-xs">
                Configure disparos automatizados de mensagens (via n8n ou WhatsApp) quando um negócio entra numa nova etapa no painel Kanban.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Seção WhatsApp Embutido */}
              <div className="bg-emerald-50 border border-emerald-100/50 rounded-xl p-4 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm group-hover:blur-none transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <h4 className="font-semibold text-emerald-900 mb-2">Conexão Oficial com WhatsApp (Evolution)</h4>
                <p className="text-sm text-emerald-800/80 mb-4 max-w-md">Gerencie disparos, e automatize respostas conectando seu CRM direto em uma instância paralela (Headless) do WhatsApp Web usando a infraestrutura Evolution API.</p>
                
                <div className="flex flex-col md:flex-row gap-3 relative z-10 w-full md:max-w-xl items-center">
                  <Input 
                    placeholder="URL Ext. (ex: https://evo.gts.com)" 
                    className="bg-white border-emerald-200 focus-visible:ring-emerald-500 h-9" 
                    value={evoUrl} onChange={e => setEvoUrl(e.target.value)}
                  />
                  <Input 
                    placeholder="Global API Key Master" 
                    className="bg-white border-emerald-200 focus-visible:ring-emerald-500 h-9" 
                    value={evoKey} onChange={e => setEvoKey(e.target.value)}
                  />
                  {currentTenant?.whatsappConnected ? (
                    <div className="flex items-center gap-2 h-9 px-6 bg-emerald-100 text-emerald-800 rounded-md font-medium whitespace-nowrap border border-emerald-200">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      Online
                    </div>
                  ) : (
                    <Button className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 h-9 px-6 whitespace-nowrap" onClick={handleConnectWhatsapp}>
                      Gerar Instância (QR)
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {stages.map((stage) => (
                  <div key={`int-${stage.id}`} className="flex flex-col gap-2 p-3.5 border border-border/50 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', stage.color)} />
                      <span className="text-sm font-semibold">Quando entrar em "{stage.name}":</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input 
                        placeholder="Nó Secundário (Webhook n8n / Disparo Especial) Ex: https://n8n.meudominio.com/webhook/..." 
                        className="h-8 md:max-w-xl bg-muted/20 text-xs font-mono" 
                      />
                      <Button size="sm" variant="secondary" className="h-8 text-xs font-medium border border-border/60">
                        Salvar Webhook
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-8 text-center text-foreground">
          <DialogHeader className="items-center pb-2">
            <DialogTitle className="text-xl">Pareando WhatsApp (Evolution)</DialogTitle>
            <DialogDescription>Abra o WhatsApp do seu celular no menu "Aparelhos conectados" e aponte para a tela.</DialogDescription>
          </DialogHeader>
          
          <div className="w-[250px] h-[250px] bg-muted/20 border-2 border-border/50 border-dashed rounded-2xl flex items-center justify-center overflow-hidden my-4">
            {loadingQr ? (
              <div className="animate-pulse flex flex-col items-center gap-3">
                <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <span className="text-sm text-muted-foreground font-medium">Buscando Sessão...</span>
              </div>
            ) : qrCodeData ? (
              <div className="w-full h-full p-2 bg-white">
                <img src={qrCodeData} alt="QR Code WhatsApp" width={250} height={250} className="w-full h-full object-contain" />
              </div>
            ) : null}
          </div>
          
          <Button variant="outline" className="mt-2 w-full max-w-[250px]" onClick={() => setQrModalOpen(false)}>Cancelar</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
