'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'

interface ConversationListProps {
  conversations: Conversation[]
  selectedContactId: string | null
  onSelectContact: (contactId: string) => void
  isLoading?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatPhone(name: string, phone: string) {
  // Se o nome é o próprio número, formatar bonito
  if (name === phone && phone.length >= 12) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`
  }
  return name
}

export function ConversationList({
  conversations,
  selectedContactId,
  onSelectContact,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) => {
    const term = search.toLowerCase()
    return (
      c.contact.name.toLowerCase().includes(term) ||
      c.contact.phone.includes(term)
    )
  })

  return (
    <div className="flex h-full flex-col border-r border-border/40">
      {/* Header */}
      <div className="border-b border-border/40 p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Conversas</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border/40 focus-visible:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Lista */}
      <ScrollArea className="flex-1">
        {isLoading && conversations.length === 0 ? (
          <div className="space-y-1 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-40 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Search className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">
              {search ? 'Nenhum resultado encontrado' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filtered.map((conv) => (
              <button
                key={conv.contact.id}
                onClick={() => onSelectContact(conv.contact.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-150',
                  'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20',
                  selectedContactId === conv.contact.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500'
                    : 'border-l-2 border-transparent',
                )}
              >
                <Avatar className="h-10 w-10 shrink-0 border border-border/40">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900 dark:text-emerald-300">
                    {getInitials(conv.contact.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {formatPhone(conv.contact.name, conv.contact.phone)}
                    </span>
                    {conv.lastMessage && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.lastMessage?.isFromMe && (
                        <span className="text-emerald-600 dark:text-emerald-400">Você: </span>
                      )}
                      {conv.lastMessage?.content || 'Sem mensagens'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white hover:bg-emerald-500">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
