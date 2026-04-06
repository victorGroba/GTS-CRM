import { Card, CardContent } from '@/components/ui/card'
import { Deal, Contact } from '@/types'
import { DollarSign, Users as UsersIcon, Target, TrendingUp } from 'lucide-react'

interface StatCardsProps {
  deals: Deal[]
  contacts: Contact[]
}

const iconColors = [
  { bg: 'bg-primary/10', text: 'text-primary' },
  { bg: 'bg-[hsl(192,100%,50%)]/10', text: 'text-[hsl(192,100%,50%)]' },
  { bg: 'bg-success/10', text: 'text-success' },
  { bg: 'bg-[hsl(280,60%,55%)]/10', text: 'text-[hsl(280,60%,55%)]' },
]

export function StatCards({ deals, contacts }: StatCardsProps) {
  const openDeals = deals.filter((d) => d.status === 'OPEN')
  const totalValue = openDeals.reduce((sum, d) => sum + d.value, 0)

  const wonDeals = deals.filter((d) => d.status === 'WON').length
  const closedDeals = deals.filter((d) => d.status === 'WON' || d.status === 'LOST').length
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0

  const stats = [
    {
      label: 'Valor em Negociação',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
      sub: `${openDeals.length} negócios abertos`,
      icon: DollarSign,
      colors: iconColors[0],
    },
    {
      label: 'Contatos Ativos',
      value: contacts.length.toString(),
      sub: 'Cadastrados no sistema',
      icon: UsersIcon,
      colors: iconColors[1],
    },
    {
      label: 'Taxa de Conversão',
      value: `${winRate}%`,
      sub: 'Baseado em fechados',
      icon: TrendingUp,
      colors: iconColors[2],
    },
    {
      label: 'Negócios Ganhos',
      value: wonDeals.toString(),
      sub: 'Total histórico',
      icon: Target,
      colors: iconColors[3],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className={`stat-card border-border/50 shadow-sm animate-fade-in-up stagger-${index + 1}`}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <div className={`p-2 rounded-lg ${stat.colors.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.colors.text}`} />
              </div>
            </div>
            <div className="animate-count-up">
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
