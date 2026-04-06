'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Send,
  Paperclip,
  Mic,
  ArrowLeft,
  Phone,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Contact, Message } from '@/types'

interface ChatThreadProps {
  contact: Contact | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onBack?: () => void
  isSending?: boolean
  showBackButton?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatPhone(phone: string) {
  if (phone.length >= 12) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`
  }
  return phone
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  let currentDate = ''

  for (const msg of messages) {
    const msgDate = format(new Date(msg.createdAt), 'dd/MM/yyyy')
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groups.push({ date: msgDate, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return groups
}

function getDateLabel(dateStr: string) {
  const today = format(new Date(), 'dd/MM/yyyy')
  const yesterday = format(new Date(Date.now() - 86400000), 'dd/MM/yyyy')
  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'
  return dateStr
}

export function ChatThread({
  contact,
  messages,
  onSendMessage,
  onBack,
  isSending,
  showBackButton,
}: ChatThreadProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMessageCountRef = useRef(0)

  // Auto-scroll para o final quando novas mensagens chegam
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length !== prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length
      // Pequeno delay para garantir que o DOM atualizou
      setTimeout(scrollToBottom, 50)
    }
  }, [messages.length, scrollToBottom])

  // Scroll inicial ao selecionar contato
  useEffect(() => {
    setTimeout(scrollToBottom, 100)
  }, [contact?.id, scrollToBottom])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return
    onSendMessage(trimmed)
    setInput('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-grow textarea
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  // Estado vazio: nenhum contato selecionado
  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-950/10 dark:to-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/80 dark:bg-emerald-900/30">
            <MessageSquare className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">GTS Chat</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione uma conversa para começar
            </p>
          </div>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-stone-50/50 to-white dark:from-zinc-900/50 dark:to-background">
      {/* Header do chat */}
      <div className="flex items-center gap-3 border-b border-border/40 bg-white/80 px-4 py-3 backdrop-blur-sm dark:bg-background/80">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-9 w-9 border border-border/40">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900 dark:text-emerald-300">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {contact.name === contact.phone ? formatPhone(contact.phone) : contact.name}
          </h3>
          {contact.name !== contact.phone && contact.phone && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {formatPhone(contact.phone)}
            </p>
          )}
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-1 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            messageGroups.map((group) => (
              <div key={group.date}>
                {/* Separador de data */}
                <div className="flex items-center justify-center py-3">
                  <span className="rounded-full bg-muted/80 px-3 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
                    {getDateLabel(group.date)}
                  </span>
                </div>

                {/* Mensagens do dia */}
                <div className="space-y-1.5">
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        msg.isFromMe ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'relative max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm',
                          msg.isFromMe
                            ? 'bg-emerald-600 text-white rounded-br-md'
                            : 'bg-white dark:bg-zinc-800 border border-border/30 text-foreground rounded-bl-md',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed">
                          {msg.content}
                        </p>
                        <div
                          className={cn(
                            'mt-1 flex items-center justify-end gap-1',
                            msg.isFromMe ? 'text-emerald-200' : 'text-muted-foreground',
                          )}
                        >
                          {msg.status === 'FAILED' && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-3 w-3 text-red-400" />
                              </TooltipTrigger>
                              <TooltipContent>Falha no envio</TooltipContent>
                            </Tooltip>
                          )}
                          <span className="text-[10px]">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Barra de input */}
      <div className="border-t border-border/40 bg-white/80 px-4 py-3 backdrop-blur-sm dark:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                disabled
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Em breve</TooltipContent>
          </Tooltip>

          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Digite uma mensagem..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none rounded-xl border-border/40 bg-muted/50 pr-10 text-sm focus-visible:ring-emerald-500/30"
            />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                disabled
              >
                <Mic className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Em breve</TooltipContent>
          </Tooltip>

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            size="icon"
            className="shrink-0 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
