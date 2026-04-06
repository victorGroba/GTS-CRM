'use client'

import { useStore } from '@/store/Store'
import { StatCards } from '@/components/dashboard/StatCards'
import { PipelineChart } from '@/components/dashboard/PipelineChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function IndexPage() {
  const { deals, contacts, stages, users } = useStore()

  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Bem-vindo ao seu painel de controle de vendas.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-white/80 border px-3 py-1.5 rounded-full">
          <Clock className="h-3 w-3" />
          {format(new Date(), "dd 'de' MMM, HH:mm", { locale: ptBR })}
        </div>
      </div>

      <StatCards deals={deals} contacts={contacts} />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <PipelineChart deals={deals} stages={stages} />

        <Card className="col-span-1 shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Negócios Recentes</CardTitle>
                <CardDescription className="text-xs">Últimos 5 criados</CardDescription>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDeals.map((deal, index) => {
                const stage = stages.find((s) => s.id === deal.stageId)
                const user = users.find((u) => u.id === deal.assignedUserId)
                return (
                  <div
                    key={deal.id}
                    className={`flex flex-col gap-1.5 pb-3 animate-fade-in-up stagger-${index + 1} ${
                      index < recentDeals.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm truncate mr-2">{deal.title}</span>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(deal.value)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal border-border/60">
                        {stage?.name || 'Sem etapa'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {user?.name.split(' ')[0]} · {format(new Date(deal.createdAt), 'dd MMM', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )
              })}
              {recentDeals.length === 0 && (
                <div className="text-sm text-center text-muted-foreground py-8">
                  Nenhum negócio encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
