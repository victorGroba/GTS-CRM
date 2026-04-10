'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Rocket } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/Store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { currentUser, isAuthenticated, logout } = useStore()

  // Guard: Somente usuários SUPERADMIN podem acessar
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Se seu enum "caiu" como string e não como "SUPERADMIN" do Prisma puro, tratamos as strings
  if (currentUser?.role !== 'SUPERADMIN') {
    // Redireciona usuários comuns para a área de vendedores
    router.push('/pipeline')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/tenants" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/cliente-mattos/logo_mattos.png"
                alt="Lab Mattos Logo"
                width={32}
                height={32}
                className="relative drop-shadow-sm"
              />
              <span className="text-[10px] ml-2 font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Super Admin
              </span>
            </Link>
          </div>
          
          <div className="flex flex-1 justify-center max-w-md mx-6">
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin/tenants" className="flex items-center gap-2 text-primary hover:text-primary transition-colors">
                <Rocket className="w-4 h-4" />
                Clientes (Tenants)
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3 flex-none">

            <Button variant="ghost" className="text-muted-foreground hover:text-destructive gap-2 h-9 px-3" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:py-8 animate-fade-in-up">
        {children}
      </main>
    </div>
  )
}
