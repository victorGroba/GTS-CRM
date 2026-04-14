'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  Users,
  MessageCircle,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  User,
  Rocket,
  Route,
  Building2,
  TicketCheck,
  ListTodo,
  Loader2,
} from 'lucide-react'
import { useStore } from '@/store/Store'
import { UserProfileModal } from '@/components/users/UserProfileModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Pipeline', url: '/pipeline', icon: Target },
  { title: 'JourneyFlow', url: '/journey', icon: Route },
  { title: 'Contatos', url: '/contacts', icon: Users },
  { title: 'Empresas', url: '/companies', icon: Building2 },
  { title: 'Tickets', url: '/tickets', icon: TicketCheck },
  { title: 'Tarefas', url: '/tasks', icon: ListTodo },
  { title: 'Chat', url: '/chat', icon: MessageCircle },
  { title: 'Configurações', url: '/settings', icon: Settings, adminOnly: true },
]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, currentTenant, isAuthenticated, isHydrating, activeUserId, logout } = useStore()
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  if (!isAuthenticated) {
    if (isHydrating || activeUserId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-gradient-light">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    router.push('/login')
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        if (item.adminOnly && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPERADMIN') return null
        const isActive = pathname === item.url
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              'flex items-center gap-2 transition-all',
              mobile 
                ? 'px-4 py-3 rounded-lg text-base font-medium' 
                : 'px-3 py-2 rounded-md text-sm font-medium',
              isActive
                ? mobile
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary/5 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <item.icon className={cn(mobile ? 'h-5 w-5' : 'h-4 w-4')} />
            {item.title}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen flex flex-col bg-brand-gradient-light">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand (Left) */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <Image
                src="/cliente-mattos/logo_mattos.png"
                alt="Lab Mattos Logo"
                width={32}
                height={32}
                className="drop-shadow-sm"
              />
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-foreground leading-tight">
                  Lab Mattos CRM
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
                  {currentTenant?.name || 'Gestão de Vendas'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              <NavLinks />
            </nav>
          </div>

          {/* Search, Notifications & Profile (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder="Buscar em todo o CRM..."
                className="pl-9 h-9 bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-white focus:border-primary/30 transition-all text-sm rounded-full"
              />
            </div>

            {currentUser?.role === 'SUPERADMIN' && (
              <Link
                href="/admin/tenants"
                className="flex items-center gap-2 text-primary font-medium px-4 py-2 hover:bg-primary/5 rounded-md transition-colors"
              >
                <Rocket className="w-5 h-5" />
                SaaS Master
              </Link>
            )}

            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-[hsl(192,100%,50%)] rounded-full border border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full px-0">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                    <AvatarImage src={currentUser?.avatarUrl} />
                    <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                      {currentUser?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Minha Conta</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/cliente-mattos/logo_mattos.png" alt="Lab Mattos Logo" width={24} height={24} />
                    Lab Mattos CRM
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1.5 p-4">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:py-8 animate-fade-in-up">
        {children}
      </main>

      <UserProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
    </div>
  )
}
