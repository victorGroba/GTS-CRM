'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { StoreProvider } from '@/store/Store'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <StoreProvider>
        {children}
        <Toaster />
        <Sonner />
      </StoreProvider>
    </TooltipProvider>
  )
}
