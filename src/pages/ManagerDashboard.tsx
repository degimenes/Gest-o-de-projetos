import { useLocation, Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { KpiCard } from '@/components/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ManagerDashboard() {
  const { search } = useLocation()
  const { toast } = useToast()
  const { isLoading, margemCritica, user, users, projects, isSyncing, triggerSync } = useApp()

  const handleSync = async () => {
    try {
      await triggerSync()
      toast({
        title: 'Sincronização Concluída',
        description: 'Os dados dos projetos foram atualizados a partir do Odoo.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro na Sincronização',
        description: err?.data?.message || err?.message || 'Falha ao conectar com o Odoo.',
        variant: 'destructive',
      })
    }
  }
  const params = new URLSearchParams(search)
  const id = params.get('id') || user?.id

  if (!id) return <Navigate to="/dashboard" replace />

  const manager = users.find((u) => u.id === id) || user
  const managerProjects = projects.filter((p) => p.managerId === id)

  // Calc totals
  const totalReceita = managerProjects.reduce((acc, p) => acc + p.financials.rLiquida, 0)
  const totalCusto = managerProjects.reduce((acc, p) => acc + p.financials.cVendasTotal, 0)
  const totalLucro = managerProjects.reduce((acc, p) => acc + p.financials.mLiquida, 0)
  const avgMargem = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Visão do Gerente: {manager?.name}
          </h2>
          <p className="text-slate-500 text-sm">
            Acompanhamento dos projetos sob responsabilidade de {manager?.name}.
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          variant="outline"
          className="bg-white border-slate-200"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Odoo'}
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Projetos Ativos" value={managerProjects.length} loading={isLoading} />
        <KpiCard
          title="Receita Gerenciada"
          value={`R$ ${(totalReceita / 1000).toFixed(1)}k`}
          loading={isLoading}
        />
        <KpiCard
          title="Lucro Projetado"
          value={`R$ ${(totalLucro / 1000).toFixed(1)}k`}
          loading={isLoading}
        />
        <KpiCard
          title="Margem Média"
          value={`${avgMargem}%`}
          description={`Meta: > ${margemCritica}%`}
          loading={isLoading}
        />
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead className="text-right">Receita (R$)</TableHead>
                    <TableHead className="text-right">Custos (R$)</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managerProjects.length > 0 ? (
                    managerProjects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">
                          {p.financials.rLiquida.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.financials.cVendasTotal.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              'font-semibold',
                              p.financials.margemLiquidaPercent < margemCritica
                                ? 'text-red-600'
                                : 'text-emerald-600',
                            )}
                          >
                            {p.financials.margemLiquidaPercent}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={p.status === 'Concluído' ? 'secondary' : 'default'}
                            className={
                              p.status === 'Concluído'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-[#0ABFBC] text-white'
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        Nenhum projeto encontrado para este gerente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
