import { useStore } from '@/store/Store'
import { DealCard } from './DealCard'
import { Deal } from '@/types'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface BoardProps {
  onEditDeal: (deal: Deal) => void
}

export function Board({ onEditDeal }: BoardProps) {
  const { stages, deals, contacts, users, moveDeal, currentTenant } = useStore()
  const dragOverRef = useRef<string | null>(null)

  const updateDealStage = async (dealId: string, newStageId: string, fromStageId: string, tenantId: string) => {
    try {
      await fetch(`/api/deals/${dealId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: newStageId, fromStageId, tenantId }),
      })
    } catch (error) {
      console.error('Failed to update stage on backend:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverRef.current !== stageId) {
      if (dragOverRef.current) {
        document.getElementById(`stage-${dragOverRef.current}`)?.classList.remove('pipeline-column-active')
      }
      dragOverRef.current = stageId
      document.getElementById(`stage-${stageId}`)?.classList.add('pipeline-column-active')
    }
  }

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    const target = e.currentTarget as HTMLElement
    const related = e.relatedTarget as HTMLElement | null
    if (!related || !target.contains(related)) {
      target.classList.remove('pipeline-column-active')
      if (dragOverRef.current === stageId) dragOverRef.current = null
    }
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    document.getElementById(`stage-${stageId}`)?.classList.remove('pipeline-column-active')
    dragOverRef.current = null
    const dealId = e.dataTransfer.getData('text/plain')
    if (dealId && currentTenant) {
      const deal = deals.find(d => d.id === dealId)
      if (deal && deal.stageId !== stageId) {
        moveDeal(dealId, stageId)
        updateDealStage(dealId, stageId, deal.stageId, currentTenant.id)
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-x-auto pb-4 items-start snap-x custom-scrollbar">
      {stages.map((stage, stageIndex) => {
        const stageDeals = deals.filter((d) => d.stageId === stage.id && d.status === 'OPEN')
        const totalValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0)

        return (
          <div
            key={stage.id}
            id={`stage-${stage.id}`}
            className={`flex-shrink-0 w-[310px] pipeline-column flex flex-col max-h-full snap-center animate-fade-in-up stagger-${Math.min(stageIndex + 1, 4)}`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={(e) => handleDragLeave(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
            style={{
              '--column-border-color': `hsl(192, 100%, 50%)`,
            } as React.CSSProperties}
          >
            <div className="p-3.5 border-b border-border/40">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-offset-1', stage.color)} />
                  {stage.name}
                </h3>
                <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-full text-muted-foreground shadow-sm border border-border/40">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalValue)}
              </div>
            </div>

            <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[100px] custom-scrollbar">
              {stageDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  contact={contacts.find((c) => c.id === deal.contactId)}
                  user={users.find((u) => u.id === deal.assignedUserId)}
                  onEdit={onEditDeal}
                />
              ))}
              {stageDeals.length === 0 && (
                <div className="h-full flex items-center justify-center p-4 border-2 border-dashed border-border/40 rounded-lg">
                  <span className="text-[11px] text-muted-foreground/60 text-center">
                    Solte negócios aqui
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
