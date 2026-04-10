'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/store/Store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Plus, Search, Clock, AlertTriangle, Zap, ListTodo } from 'lucide-react'
import { Task } from '@/types'
import { TaskModal } from '@/components/tasks/TaskModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const triggerLabels: Record<string, { label: string; className: string }> = {
  MANUAL: { label: 'Manual', className: 'bg-gray-100 text-gray-600' },
  LEAD_FRIO: { label: 'Lead Frio', className: 'bg-blue-100 text-blue-700' },
  FOLLOW_UP: { label: 'Follow-up', className: 'bg-purple-100 text-purple-700' },
  POS_VENDA: { label: 'Pós-venda', className: 'bg-emerald-100 text-emerald-700' },
  TICKET_ABERTO: { label: 'Ticket', className: 'bg-orange-100 text-orange-700' },
}

export default function TasksPage() {
  const { tasks, contacts, currentUser, updateTask } = useStore()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | 'mine' | 'auto'>('mine')

  const filteredTasks = useMemo(() => {
    let result = tasks
    if (filter === 'mine') result = result.filter((t) => t.userId === currentUser?.id)
    if (filter === 'auto') result = result.filter((t) => t.trigger !== 'MANUAL')
    if (search) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        contacts.find((c) => c.id === t.contactId)?.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    return result.sort((a, b) => {
      if (a.status === 'DONE' && b.status !== 'DONE') return 1
      if (a.status !== 'DONE' && b.status === 'DONE') return -1
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return 0
    })
  }, [tasks, filter, search, currentUser, contacts])

  const pendingCount = tasks.filter((t) => t.status === 'PENDING' && t.userId === currentUser?.id).length
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'DONE') return false
    return new Date(t.dueDate) < new Date()
  }).length

  const handleNew = () => { setSelectedTask(null); setIsModalOpen(true) }
  const handleEdit = (task: Task) => { setSelectedTask(task); setIsModalOpen(true) }
  const toggleDone = (task: Task) => {
    updateTask(task.id, { status: task.status === 'DONE' ? 'PENDING' : 'DONE' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Smart To-Do</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pendingCount} pendente(s){overdueCount > 0 && `, ${overdueCount} atrasada(s)`}
          </p>
        </div>
        <Button onClick={handleNew} style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }} className="shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <ListTodo className="h-8 w-8 text-primary/60" />
          <div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-2xl font-bold">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Zap className="h-8 w-8 text-purple-400" />
          <div>
            <p className="text-2xl font-bold">{tasks.filter((t) => t.trigger !== 'MANUAL').length}</p>
            <p className="text-xs text-muted-foreground">Automáticas</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-2xl font-bold">{tasks.filter((t) => t.status === 'DONE').length}</p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input placeholder="Buscar tarefas..." className="pl-9 h-9 bg-muted/40 border-transparent text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {([['mine', 'Minhas'], ['all', 'Todas'], ['auto', 'Automáticas']] as const).map(([key, label]) => (
            <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)} className="text-xs">
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => {
          const contact = contacts.find((c) => c.id === task.contactId)
          const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date()
          const trigger = triggerLabels[task.trigger] || triggerLabels.MANUAL

          return (
            <Card key={task.id} className={`p-4 transition-all hover:shadow-md cursor-pointer ${task.status === 'DONE' ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200' : ''}`}>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.status === 'DONE'}
                  onCheckedChange={() => toggleDone(task)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0" onClick={() => handleEdit(task)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm ${task.status === 'DONE' ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    {task.trigger !== 'MANUAL' && (
                      <Badge variant="secondary" className={`text-[9px] ${trigger.className}`}>{trigger.label}</Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="text-[9px]">Atrasada</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {contact && <span>{contact.name}</span>}
                    {task.dueDate && (
                      <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                        Prazo: {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        }) : (
          <Card className="p-12 text-center text-muted-foreground bg-muted/30 border-dashed">
            <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted" />
            <p>Nenhuma tarefa encontrada.</p>
          </Card>
        )}
      </div>

      <TaskModal task={selectedTask} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
