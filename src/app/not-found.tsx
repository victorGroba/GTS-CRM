'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(192, 100%, 50%) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 text-center p-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-0 max-w-md w-full mx-4 animate-fade-in-up">
        <Image
          src="/logoGTS.png"
          alt="GTS Logo"
          width={48}
          height={48}
          className="mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Não conseguimos encontrar a página{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold text-foreground break-all">
            {pathname}
          </code>
        </p>
        <Button
          asChild
          className="w-full shadow-lg shadow-primary/25"
          style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }}
        >
          <Link href="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}
