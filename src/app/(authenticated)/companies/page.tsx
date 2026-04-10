'use client'

import { useState } from 'react'
import { useStore } from '@/store/Store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit2, Trash2, Building2, DollarSign } from 'lucide-react'
import { Company } from '@/types'
import { CompanyModal } from '@/components/companies/CompanyModal'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function CompaniesPage() {
  const { companies, contacts, orders, deleteCompany } = useStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm) ||
      c.segment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNew = () => { setSelectedCompany(null); setIsModalOpen(true) }
  const handleEdit = (company: Company) => { setSelectedCompany(company); setIsModalOpen(true) }
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir empresa ${name}?`)) {
      deleteCompany(id)
      toast({ title: 'Empresa Excluída', description: `${name} foi removida.` })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Empresas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visão B2B 360 - Gerencie contas e faturamento.</p>
        </div>
        <Button onClick={handleNew} style={{ background: 'linear-gradient(135deg, hsl(235, 70%, 45%), hsl(235, 60%, 50%))' }} className="shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Nova Empresa
        </Button>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input placeholder="Buscar por nome, CNPJ ou segmento..." className="pl-9 h-9 bg-muted/40 border-transparent focus:border-primary/20 focus:bg-white transition-all text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Empresa</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">CNPJ</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Segmento</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Contatos</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Faturamento</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => {
                const companyContacts = contacts.filter((c) => c.companyId === company.id)
                const companyOrders = orders.filter((o) => o.companyId === company.id)
                const totalRevenue = companyOrders.filter((o) => o.status === 'PAID').reduce((s, o) => s + o.amount, 0)

                return (
                  <TableRow key={company.id} className="hover:bg-primary/[0.02] transition-colors">
                    <TableCell>
                      <Link href={`/companies/${company.id}`} className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors">
                        <Building2 className="h-4 w-4 text-primary/50" />
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{company.cnpj || '-'}</TableCell>
                    <TableCell>
                      {company.segment ? <Badge variant="secondary" className="text-[10px]">{company.segment}</Badge> : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{companyContacts.length}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(company)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(company.id, company.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhuma empresa encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <CompanyModal company={selectedCompany} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
