import { Deal, Contact, User } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface DealCardProps {
  deal: Deal
  contact?: Contact
  user?: User
  onEdit: (deal: Deal) => void
}

export function DealCard({ deal, contact, user, onEdit }: DealCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      ;(e.target as HTMLElement).style.opacity = '0.4'
      ;(e.target as HTMLElement).style.transform = 'scale(0.98)'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.target as HTMLElement).style.opacity = '1'
    ;(e.target as HTMLElement).style.transform = ''
  }

  const statusConfig = {
    OPEN: { label: 'Em andamento', className: 'border-primary/20 text-primary bg-primary/5' },
    WON: { label: 'Ganho', className: 'border-success/20 text-success bg-success/5' },
    LOST: { label: 'Perdido', className: 'border-destructive/20 text-destructive bg-destructive/5' },
  }

  const status = statusConfig[deal.status]

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit(deal)}
      className="deal-card group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {deal.title}
        </h4>
      </div>

      <div className="flex flex-col gap-1 mb-3">
        <span className="text-[11px] text-muted-foreground">
          {contact?.name || 'Sem contato'}
        </span>
        <span className="font-semibold text-sm">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(deal.value)}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border/30">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-normal ${status.className}`}>
          {status.label}
        </Badge>
        <Avatar className="h-6 w-6 border border-border/40">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
            {user?.name.substring(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
