'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/store/Store'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatThread } from '@/components/chat/ChatThread'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import type { Conversation, Message, Contact } from '@/types'

const CONVERSATIONS_POLL_MS = 5000
const MESSAGES_POLL_MS = 3000

export default function ChatPage() {
  const { currentTenant } = useStore()
  const tenantId = currentTenant?.id

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Ref para o timestamp da última mensagem (polling otimizado)
  const lastMessageTimestampRef = useRef<string | null>(null)
  const conversationsPollRef = useRef<NodeJS.Timeout | null>(null)
  const messagesPollRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Buscar conversas
  const fetchConversations = useCallback(async () => {
    if (!tenantId) return
    try {
      const res = await fetch(`/api/chat/conversations?tenantId=${tenantId}`)
      if (res.ok) {
        const data: Conversation[] = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [tenantId])

  // Buscar mensagens do contato selecionado
  const fetchMessages = useCallback(
    async (isPolling = false) => {
      if (!tenantId || !selectedContactId) return
      try {
        let url = `/api/chat/messages?contactId=${selectedContactId}&tenantId=${tenantId}`
        if (isPolling && lastMessageTimestampRef.current) {
          url += `&after=${encodeURIComponent(lastMessageTimestampRef.current)}`
        }

        const res = await fetch(url)
        if (res.ok) {
          const data: Message[] = await res.json()
          if (isPolling && lastMessageTimestampRef.current) {
            // Append novas mensagens
            if (data.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id))
                const newMsgs = data.filter((m) => !existingIds.has(m.id))
                return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev
              })
              lastMessageTimestampRef.current = data[data.length - 1].createdAt
            }
          } else {
            // Load completo
            setMessages(data)
            if (data.length > 0) {
              lastMessageTimestampRef.current = data[data.length - 1].createdAt
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    },
    [tenantId, selectedContactId],
  )

  // Polling de conversas
  useEffect(() => {
    fetchConversations()
    conversationsPollRef.current = setInterval(fetchConversations, CONVERSATIONS_POLL_MS)
    return () => {
      if (conversationsPollRef.current) clearInterval(conversationsPollRef.current)
    }
  }, [fetchConversations])

  // Fetch + polling de mensagens ao selecionar contato
  useEffect(() => {
    if (!selectedContactId) {
      setMessages([])
      lastMessageTimestampRef.current = null
      return
    }

    // Fetch completo imediato
    fetchMessages(false)

    // Polling incremental
    messagesPollRef.current = setInterval(() => fetchMessages(true), MESSAGES_POLL_MS)
    return () => {
      if (messagesPollRef.current) clearInterval(messagesPollRef.current)
    }
  }, [selectedContactId, fetchMessages])

  // Enviar mensagem
  const handleSendMessage = async (content: string) => {
    if (!tenantId || !selectedContactId) return
    setIsSending(true)

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: selectedContactId, content, tenantId }),
      })

      if (res.ok) {
        const newMessage: Message = await res.json()
        setMessages((prev) => [...prev, newMessage])
        lastMessageTimestampRef.current = newMessage.createdAt
        // Atualizar lista de conversas imediatamente
        fetchConversations()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId)
    lastMessageTimestampRef.current = null
  }

  const handleBack = () => {
    setSelectedContactId(null)
  }

  // Encontrar o contato selecionado
  const selectedContact: Contact | null =
    conversations.find((c) => c.contact.id === selectedContactId)?.contact || null

  // Mobile: mostra lista OU thread
  if (isMobile) {
    if (selectedContactId && selectedContact) {
      return (
        <div className="h-[calc(100vh-4rem)]">
          <ChatThread
            contact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
            isSending={isSending}
            showBackButton
          />
        </div>
      )
    }

    return (
      <div className="h-[calc(100vh-4rem)]">
        <ConversationList
          conversations={conversations}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          isLoading={isLoadingConversations}
        />
      </div>
    )
  }

  // Desktop: layout com painéis redimensionáveis
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={22} maxSize={40}>
          <ConversationList
            conversations={conversations}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            isLoading={isLoadingConversations}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70}>
          <ChatThread
            contact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
