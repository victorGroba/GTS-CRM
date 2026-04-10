'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useStore } from '@/store/Store'
import { Deal } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.15

export function JourneyCanvas() {
  const { stages, deals, contacts, users } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }

  const handleMouseUp = () => setIsPanning(false)

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="relative flex-1 rounded-xl border border-border/40 bg-white/50 backdrop-blur-sm overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-lg border border-border/40 shadow-lg p-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono font-medium text-muted-foreground w-10 text-center">
          {zoomPercent}%
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border/60" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetView}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas hint */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <MousePointer2 className="h-3.5 w-3.5" />
        Arraste para navegar &middot; Scroll para zoom
      </div>

      {/* Panning container */}
      <div
        ref={containerRef}
        className={cn('h-[calc(100vh-14rem)] w-full', isPanning ? 'cursor-grabbing' : 'cursor-grab')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="h-full w-full origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Pipeline columns in canvas space */}
          <div className="flex gap-6 p-8 items-start min-w-max">
            {stages.map((stage, idx) => {
              const stageDeals = deals.filter((d) => d.stageId === stage.id && d.status === 'OPEN')
              const totalValue = stageDeals.reduce((s, d) => s + d.value, 0)
              const wonDeals = deals.filter((d) => d.stageId === stage.id && d.status === 'WON')

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  {/* Stage node */}
                  <div
                    className={cn(
                      'w-[280px] rounded-2xl border-2 bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl',
                      selectedDeal && stageDeals.some((d) => d.id === selectedDeal.id)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border/40 hover:border-primary/30'
                    )}
                  >
                    {/* Stage header */}
                    <div className="p-4 border-b border-border/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-3 h-3 rounded-full ring-2 ring-offset-1', stage.color)} />
                          <h3 className="font-bold text-sm">{stage.name}</h3>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {stageDeals.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                      </div>
                      {wonDeals.length > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium mt-1">
                          {wonDeals.length} ganho(s)
                        </div>
                      )}
                    </div>

                    {/* Deal cards */}
                    <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {stageDeals.map((deal) => {
                        const contact = contacts.find((c) => c.id === deal.contactId)
                        const user = users.find((u) => u.id === deal.assignedUserId)
                        const isSelected = selectedDeal?.id === deal.id

                        return (
                          <div
                            key={deal.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDeal(isSelected ? null : deal)
                            }}
                            className={cn(
                              'p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                                : 'border-border/30 bg-white hover:border-primary/20'
                            )}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="font-medium text-xs leading-tight line-clamp-2">{deal.title}</span>
                              <span className="font-bold text-xs text-primary ml-2 shrink-0">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{contact?.name || '-'}</span>
                              <Avatar className="h-5 w-5 border border-border/40">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                                  {user?.name?.substring(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        )
                      })}
                      {stageDeals.length === 0 && (
                        <div className="text-center py-6 text-[11px] text-muted-foreground/50">
                          Sem negócios
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector arrow to next stage */}
                  {idx < stages.length - 1 && (
                    <div className="absolute" style={{ left: `${idx * 316 + 280}px`, top: '80px' }}>
                      <svg width="36" height="20" viewBox="0 0 36 20" className="text-border">
                        <path d="M0 10 L30 10 M24 4 L30 10 L24 16" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected deal detail panel */}
      {selectedDeal && (
        <div className="absolute bottom-3 right-3 z-20 w-80 bg-white/95 backdrop-blur-md rounded-xl border border-border/40 shadow-2xl p-4 animate-fade-in-up">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-sm">{selectedDeal.title}</h4>
            <button
              onClick={() => setSelectedDeal(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              &times;
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedDeal.value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contato</span>
              <span className="font-medium">{contacts.find((c) => c.id === selectedDeal.contactId)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Responsável</span>
              <span className="font-medium">{users.find((u) => u.id === selectedDeal.assignedUserId)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Etapa</span>
              <span className="font-medium">{stages.find((s) => s.id === selectedDeal.stageId)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-[10px]">{selectedDeal.status}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
