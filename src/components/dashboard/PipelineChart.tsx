import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Deal, Stage } from '@/types'

interface PipelineChartProps {
  deals: Deal[]
  stages: Stage[]
}

export function PipelineChart({ deals, stages }: PipelineChartProps) {
  const data = useMemo(() => {
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stageId === stage.id && d.status === 'OPEN')
      const value = stageDeals.reduce((sum, d) => sum + d.value, 0)
      return {
        name: stage.name,
        count: stageDeals.length,
        value: value,
      }
    })
  }, [deals, stages])

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Valor por Etapa do Funil</CardTitle>
        <CardDescription className="text-xs">Negócios em aberto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(235, 70%, 45%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(192, 100%, 50%)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 15%, 93%)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$${value / 1000}k`}
                tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(220, 20%, 95%)', opacity: 0.5 }}
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid hsl(220, 15%, 91%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  padding: '8px 12px',
                  fontSize: '13px',
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                }
              />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
