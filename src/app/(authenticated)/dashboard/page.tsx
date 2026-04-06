'use client'

import { useStore } from '@/store/Store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, DollarSign, Target } from 'lucide-react'

export default function DashboardPage() {
  const { deals } = useStore()

  const openDeals = deals.filter((d) => d.status === 'OPEN')
  const totalOpenDealsValue = openDeals.reduce((acc, d) => acc + d.value, 0)

  const now = new Date()
  const wonDealsThisMonth = deals.filter(
    (d) => d.status === 'WON' && isSameMonth(new Date(d.createdAt), now),
  )
  const totalWonDealsThisMonthValue = wonDealsThisMonth.reduce((acc, d) => acc + d.value, 0)

  const wonDealsCount = deals.filter((d) => d.status === 'WON').length
  const totalDealsCount = deals.length
  const conversionRate = totalDealsCount > 0 ? (wonDealsCount / totalDealsCount) * 100 : 0

  const hottestDeals = [...openDeals]
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value
      const dateA = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : Infinity
      const dateB = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : Infinity
      return dateA - dateB
    })
    .slice(0, 5)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const kpis = [
    {
      label: 'Total Negócios Abertos',
      value: formatCurrency(totalOpenDealsValue),
      icon: DollarSign,
      colors: { bg: 'bg-primary/10', text: 'text-primary' },
    },
    {
      label: 'Ganhos este mês',
      value: formatCurrency(totalWonDealsThisMonthValue),
      icon: TrendingUp,
      colors: { bg: 'bg-success/10', text: 'text-success' },
    },
    {
      label: 'Taxa de Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Target,
      colors: { bg: 'bg-[hsl(192,100%,50%)]/10', text: 'text-[hsl(192,100%,50%)]' },
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Dashboard Central</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Visão geral e indicadores chave de desempenho.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi, index) => (
          <Card key={kpi.label} className={`stat-card shadow-sm border-border/50 animate-fade-in-up stagger-${index + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </p>
                <div className={`p-2 rounded-lg ${kpi.colors.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.colors.text}`} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight animate-count-up">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">5 Negócios mais quentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Nome do Negócio</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Valor</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Fechamento Esperado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hottestDeals.map((deal, index) => (
                <TableRow key={deal.id} className={`hover:bg-primary/[0.02] transition-colors animate-fade-in-up stagger-${Math.min(index + 1, 4)}`}>
                  <TableCell className="font-medium text-sm">{deal.title}</TableCell>
                  <TableCell className="font-semibold text-sm">{formatCurrency(deal.value)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {deal.expectedCloseDate
                      ? format(new Date(deal.expectedCloseDate), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Não definida'}
                  </TableCell>
                </TableRow>
              ))}
              {hottestDeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum negócio aberto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
