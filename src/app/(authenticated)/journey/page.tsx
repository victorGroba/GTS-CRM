'use client'

import { JourneyCanvas } from '@/components/journey/JourneyCanvas'

export default function JourneyPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight gradient-text">JourneyFlow</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Navegue pelo funil com zoom e arraste para explorar a jornada dos clientes.
        </p>
      </div>
      <JourneyCanvas />
    </div>
  )
}
