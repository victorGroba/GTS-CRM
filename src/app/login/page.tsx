'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/Store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useStore()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/')
      } else {
        toast({
          title: 'Acesso Negado',
          description: 'Não encontramos esse e-mail ou a senha está incorreta.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-brand-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(192, 100%, 50%) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(235, 70%, 55%) 0%, transparent 70%)' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl animate-fade-in-up">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="flex justify-center mb-1">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(192, 100%, 50%))' }} />
                <Image
                  src="/cliente-mattos/logo_mattos.png"
                  alt="GTS Logo"
                  width={64}
                  height={64}
                  className="relative drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Lab Mattos CRM</span>
              </CardTitle>
              <CardDescription className="mt-1.5 text-sm">
                Faça login para acessar o sistema de gestão
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-muted/50 border-border/60 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Senha
                  </Label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium" tabIndex={-1}>
                    Esqueceu?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-muted/50 border-border/60 focus:bg-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={isLoading}
                style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 text-center border-t border-border/40 px-6 py-5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dificuldades no acesso? Contate o suporte técnico.
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} GTS · Groba Tech Solutions
        </p>
      </div>
    </div>
  )
}
