'use client'

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { Contact, Deal, Note, Stage, Tenant, User } from '../types'
import { addContactDb, deleteContactDb, updateContactDb } from '@/actions/contacts'
import { addDealDb, deleteDealDb, updateDealDb } from '@/actions/deals'

/** Helper cookies Functions */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

interface StoreContextData {
  currentUser: User | null
  currentTenant: Tenant | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  users: User[]
  contacts: Contact[]
  stages: Stage[]
  deals: Deal[]
  notes: Note[]
  tenants: Tenant[]
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'tenantId'>) => Promise<boolean>
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<boolean>
  deleteDeal: (id: string) => Promise<boolean>
  moveDeal: (dealId: string, stageId: string) => void
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'tenantId'>) => Promise<boolean>
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'tenantId'>) => Promise<boolean>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<boolean>
  deleteContact: (id: string) => Promise<boolean>
  addUser: (data: any) => Promise<boolean>
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  addStage: (data: any) => Promise<boolean>
  updateStage: (id: string, updates: Partial<Stage>) => Promise<boolean>
  deleteStage: (id: string) => Promise<boolean>
  activeTenantId: string | null
  activeUserId: string | null
}

const StoreContext = createContext<StoreContextData | undefined>(undefined)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUserId, setActiveUserId] = useState<string | null>(() => getCookie('crm_session_userId'))

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [usersStore, setUsersStore] = useState<User[]>([])
  const [contactsStore, setContactsStore] = useState<Contact[]>([])
  const [stagesStore, setStagesStore] = useState<Stage[]>([])
  const [dealsStore, setDealsStore] = useState<Deal[]>([])
  const [notesStore, setNotesStore] = useState<Note[]>([])
  const [isHydrating, setIsHydrating] = useState(false)

  // -- Hydrate Data whenever a user is active --
  const fetchData = useCallback(async (userId: string) => {
    setIsHydrating(true)
    try {
      const res = await fetch(`/api/crm/data?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUsersStore(data.users || [])
        setContactsStore(data.contacts || [])
        setStagesStore(data.stages || [])
        setDealsStore(data.deals || [])
        setNotesStore(data.notes || [])
        
        // Setup current tenant array if not populated properly
        if (data.currentTenant) {
          setTenants([data.currentTenant])
        }
      } else {
        console.error('Falha ao buscar dados do CRM')
      }
    } catch (err) {
      console.error('Erro rede:', err)
    } finally {
      setIsHydrating(false)
    }
  }, [])

  useEffect(() => {
    if (activeUserId) {
      setCookie('crm_session_userId', activeUserId)
      fetchData(activeUserId)
    } else {
      deleteCookie('crm_session_userId')
      setTenants([])
      setUsersStore([])
      setContactsStore([])
      setDealsStore([])
      setStagesStore([])
      setNotesStore([])
    }
  }, [activeUserId, fetchData])

  // Getters
  const currentUser = useMemo(() => usersStore.find((u) => u.id === activeUserId) || null, [usersStore, activeUserId])
  const activeTenantId = currentUser?.tenantId || null
  const currentTenant = useMemo(() => tenants.find((t) => t.id === activeTenantId) || null, [tenants, activeTenantId])
  const isAuthenticated = !!currentUser

  const users = useMemo(() => usersStore.filter((u) => u.tenantId === activeTenantId), [usersStore, activeTenantId])
  const contacts = useMemo(() => contactsStore.filter((c) => c.tenantId === activeTenantId), [contactsStore, activeTenantId])
  const stages = useMemo(() => stagesStore.filter((s) => s.tenantId === activeTenantId).sort((a, b) => a.order - b.order), [stagesStore, activeTenantId])
  const deals = useMemo(() => dealsStore.filter((d) => d.tenantId === activeTenantId), [dealsStore, activeTenantId])
  const notes = useMemo(() => notesStore.filter((n) => n.tenantId === activeTenantId), [notesStore, activeTenantId])

  // Login temporário para DB (Substituirá dps por NextAuth)
  const login = async (email: string, password?: string) => {
    // Como a Auth definitiva não está feita, a gente busca no DB para testar
    try {
      // Pequeno truque por estar client-side: 
      // Faremos uma call para o init passando apenas params. (Num cenário real teríamos API real de POST login)
      // Como o usuário tá fixo no Seed, vamos simular que ele tem ID "user-test" (mas não sabemos o CUID dele).
      // Vou buscar todos e achar, ou o melhor é você fazer um fetch na rota api auth q farei agora!
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        const { id } = await res.json()
        setActiveUserId(id)
        setCookie('crm_session_userId', id)
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  const logout = () => {
    setActiveUserId(null)
  }

  // --- CRUD NEGÓCIOS / DEALS ---
  const addDeal = useCallback(async (dealData: Omit<Deal, 'id' | 'createdAt' | 'tenantId'>) => {
    if (!activeTenantId) return false
    const res = await addDealDb(dealData, activeTenantId)
    if (res.success && res.data) {
      setDealsStore((prev) => [res.data as unknown as Deal, ...prev])
      return true
    }
    return false
  }, [activeTenantId])

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>) => {
    // Optimistic UI for visual snap
    setDealsStore((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } as Deal : d)))
    const res = await updateDealDb(id, updates)
    if (!res.success) {
      // Revert if error
      fetchData(activeUserId!)
      return false
    }
    return true
  }, [fetchData, activeUserId])

  const deleteDeal = useCallback(async (id: string) => {
    // Optimistic UI
    setDealsStore((prev) => prev.filter((d) => d.id !== id))
    const res = await deleteDealDb(id)
    if (!res.success) {
      fetchData(activeUserId!)
      return false
    }
    return true
  }, [fetchData, activeUserId])

  const moveDeal = useCallback((dealId: string, stageId: string) => {
     setDealsStore((prev) => prev.map((d) => (d.id === dealId ? { ...d, stageId } : d)))
  }, []) // Real database hit is handled inside Board.tsx directly via PUT route

  // --- CRUD CONTATOS / CONTACTS ---
  const addContact = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'tenantId'>) => {
    if (!activeTenantId) return false
    const res = await addContactDb(contactData, activeTenantId)
    if (res.success && res.data) {
      setContactsStore((prev) => [res.data as unknown as Contact, ...prev])
      return true
    }
    return false
  }, [activeTenantId])

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    setContactsStore((prev) =>
      prev.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact))
    )
    const res = await updateContactDb(id, updates)
    if (!res.success) {
      console.error('Falha na atualização do contato:')
      return false
    }
    return true
  }

  const addUser = async (data: any) => {
    if (!activeTenantId) return false
    const { createUserDb } = await import('@/actions/users')
    const res = await createUserDb(data, activeTenantId)
    if (res.success && res.data) {
      setUsersStore((prev) => [...prev, res.data as unknown as User])
      return true
    }
    return false
  }

  const deleteUser = async (id: string) => {
    setUsersStore((prev) => prev.filter((u) => u.id !== id))
    const { deleteUserDb } = await import('@/actions/users')
    const res = await deleteUserDb(id)
    if (!res.success) {
      fetchData(activeUserId!)
      return false
    }
    return true
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsersStore((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updates } : user))
    )
    const { updateUserDb } = await import('@/actions/users')
    const res = await updateUserDb(id, updates as any)
    if (!res.success) {
      console.error('Falha na atualização do perfil:')
      return false
    }
    return true
  }

  const addStage = async (data: any) => {
    if (!activeTenantId) return false
    const { addStageDb } = await import('@/actions/stages')
    const res = await addStageDb(data, activeTenantId)
    if (res.success && res.data) {
      setStagesStore((prev) => [...prev, res.data as unknown as Stage])
      return true
    }
    return false
  }

  const updateStage = async (id: string, updates: Partial<Stage>) => {
    setStagesStore((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    const { updateStageDb } = await import('@/actions/stages')
    const res = await updateStageDb(id, updates)
    if (!res.success) {
      fetchData(activeUserId!)
      return false
    }
    return true
  }

  const deleteStage = async (id: string) => {
    setStagesStore((prev) => prev.filter((s) => s.id !== id))
    const { deleteStageDb } = await import('@/actions/stages')
    const res = await deleteStageDb(id)
    if (!res.success) {
      fetchData(activeUserId!)
      return false
    }
    return true
  }

  const deleteContact = useCallback(async (id: string) => {
    setContactsStore((prev) => prev.filter((c) => c.id !== id))
    const res = await deleteContactDb(id)
    if (!res.success) {
      fetchData(activeUserId!)
      return false
    }
    return true
  }, [fetchData, activeUserId])

  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'tenantId'>) => {
    return false // WIP server action
  }, [])

  const value = {
    currentUser,
    currentTenant,
    isAuthenticated,
    isHydrating,
    login,
    logout,
    users,
    contacts,
    stages,
    deals,
    notes,
    tenants,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    addContact,
    updateContact,
    deleteContact,
    addUser,
    updateUser,
    deleteUser,
    addStage,
    updateStage,
    deleteStage,
    addNote,
    activeTenantId,
    activeUserId,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within a StoreProvider')
  return context
}
