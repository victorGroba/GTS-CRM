'use client'

import { useState } from 'react'
import { Board } from '@/components/pipeline/Board'
import { DealModal } from '@/components/pipeline/DealModal'
import { Deal } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function PipelinePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleNewDeal = () => {
    setSelectedDeal(null)
    setIsModalOpen(true)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Arraste os cards para mover pelas etapas.
          </p>
        </div>
        <Button
          onClick={handleNewDeal}
          className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all"
          style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Negócio
        </Button>
      </div>

      <Board onEditDeal={handleEdit} />

      <DealModal deal={selectedDeal} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
