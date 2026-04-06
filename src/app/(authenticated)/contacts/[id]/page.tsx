'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/store/Store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Building2, Mail, Phone, Calendar, MessageSquare, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { contacts, notes, addNote } = useStore()
  const [newNote, setNewNote] = useState('')

  const contact = useMemo(() => contacts.find((c) => c.id === id), [contacts, id])
  const contactNotes = useMemo(() => {
    return notes
      .filter((n) => n.contactId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notes, id])

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Contato nao encontrado</h2>
          <p className="text-muted-foreground">
            O contato que voce esta procurando nao existe ou foi removido.
          </p>
          <Button variant="outline" onClick={() => router.push('/contacts')}>
            Voltar para contatos
          </Button>
        </div>
      </div>
    )
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNote({
      contactId: contact.id,
      content: newNote.trim(),
    })
    setNewNote('')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-fade-in-up">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
        onClick={() => router.push('/contacts')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="text-center pb-4">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-sm">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-medium">
                  {contact.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{contact.company}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span className="truncate" title={contact.email}>
                    {contact.email}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span className="truncate" title={contact.company}>
                    {contact.company}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-3 shrink-0 text-foreground/70" />
                  <span>
                    Cadastrado em{' '}
                    {format(new Date(contact.createdAt), 'dd MMM, yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  Editar Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Nova Nota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note" className="sr-only">
                    Registre uma interacao ou resumo
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="O que foi conversado? Registre resumos de reunioes, ligacoes ou informacoes importantes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[120px] resize-y bg-muted/30 focus-visible:bg-background transition-colors"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Salvar Nota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-lg font-medium px-1">Historico de Atividades</h3>

            {contactNotes.length === 0 ? (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-4 text-muted" />
                  <p>Nenhuma nota registrada para este contato.</p>
                  <p className="text-sm mt-1">
                    Utilize o campo acima para adicionar a primeira interacao.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-border/60">
                {contactNotes.map((note) => (
                  <div key={note.id} className="relative flex gap-5 animate-fade-in-up">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary/20 text-primary shrink-0 z-10 shadow-sm">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/50">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            {format(new Date(note.createdAt), "dd MMM yyyy 'as' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
