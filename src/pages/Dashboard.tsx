import { useEffect, useState } from 'react'
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getProjects, syncOdooProjects } from '@/services/projects'
import { ProjectCombobox } from '@/components/project-combobox'
import { LiveProjectFinancials } from '@/components/live-project-financials'
import { getSettings } from '@/services/settings'
import { useRealtime } from '@/hooks/use-realtime'
import { calculateFinancials } from '@/lib/financial'

export default function Dashboard() {
  const { toast } = useToast()

  const [projectsData, setProjectsData] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const loadData = async () => {
    try {
      const [projRes, setRes] = await Promise.all([getProjects(), getSettings()])
      setProjectsData(projRes)
      setSettings(setRes)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('projects', () => {
    loadData()
  })

  useRealtime('settings', () => {
    loadData()
  })

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncOdooProjects()
      toast({
        title: 'Sincronização Concluída',
        description: 'Os dados dos projetos foram atualizados a partir do Odoo.',
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro na Sincronização',
        description: err?.data?.message || err?.message || 'Falha ao conectar com o Odoo.',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const margemCritica = settings?.margem_critica_pct || 15

  const projects = projectsData.map((p) => {
    const base = {
      receitaProduto: p.receita_venda_produto || 0,
      receitaServico: p.receita_venda_servico || 0,
      custoMateriais: p.custos_materiais || 0,
      custoServicos: p.custos_servicos || 0,
      custoMaoDeObra: p.custo_mao_de_obra || 0,
      despesasAdm: p.despesas_adm || 0,
    }
    const taxes = {
      issRate: settings?.iss_rate || 0,
      csllRate: settings?.csll_rate || 0,
      irpjRate: settings?.irpj_rate || 0,
    }
    const financials = calculateFinancials(base, taxes)

    return {
      id: p.id,
      name: p.nome_projeto || 'Projeto Sem Nome',
      manager: p.nome_gerente || 'Não atribuído',
      receita: financials.rLiquida,
      custo: financials.cVendasTotal,
      lucro: financials.mLiquida,
      margem: financials.margemLiquidaPercent
        ? Number(financials.margemLiquidaPercent.toFixed(1))
        : 0,
      status: p.status || 'Em Andamento',
    }
  })

  const chartData = projects.map((p) => ({
    name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
    receita: p.receita,
    custo: p.custo,
    lucro: p.lucro,
  }))

  const totalReceita = projects.reduce((acc, p) => acc + p.receita, 0)
  const totalCusto = projects.reduce((acc, p) => acc + p.custo, 0)
  const totalLucro = projects.reduce((acc, p) => acc + p.lucro, 0)
  const avgMargem = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Geral</h2>
          <p className="text-slate-500 text-sm">
            Visão consolidada do portfólio de projetos ativos e concluídos.
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing || isLoading}
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

      <Card className="shadow-sm border-slate-200 bg-white/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Consulta Financeira ao Vivo (Odoo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <ProjectCombobox value={selectedProjectId} onChange={setSelectedProjectId} />
          </div>
          {selectedProjectId && <LiveProjectFinancials projectId={selectedProjectId} />}
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Líquida Total"
          value={`R$ ${(totalReceita / 1000).toFixed(1)}k`}
          description="No período selecionado"
          loading={isLoading}
        />
        <KpiCard
          title="Custos Totais"
          value={`R$ ${(totalCusto / 1000).toFixed(1)}k`}
          description="Materiais, Serviços e MO"
          loading={isLoading}
        />
        <KpiCard
          title="Lucro Líquido"
          value={`R$ ${(totalLucro / 1000).toFixed(1)}k`}
          description="Após deduções e impostos"
          loading={isLoading}
        />
        <KpiCard
          title="Margem Média"
          value={`${avgMargem}%`}
          description={`Meta global: > ${margemCritica}%`}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Desempenho Financeiro por Projeto</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] pb-4">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-md" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                Sem dados disponíveis.
              </div>
            ) : (
              <ChartContainer
                config={{
                  receita: { label: 'Receita', color: 'hsl(var(--chart-1))' },
                  custo: { label: 'Custo', color: 'hsl(var(--chart-3))' },
                  lucro: { label: 'Lucro', color: 'hsl(var(--chart-2))' },
                }}
                className="h-full w-full"
              >
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="receita"
                    fill="var(--color-receita)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="custo"
                    fill="var(--color-custo)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="lucro"
                    fill="var(--color-lucro)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Últimos Projetos Atualizados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-slate-500 border rounded-md">
                Sem dados disponíveis.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Gerente</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium whitespace-nowrap">{p.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-slate-600">
                          {p.manager}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.margem < margemCritica && (
                              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                            )}
                            <span
                              className={cn(
                                'font-semibold',
                                p.margem < margemCritica ? 'text-red-600' : 'text-emerald-600',
                              )}
                            >
                              {p.margem}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={p.status === 'Concluído' ? 'secondary' : 'default'}
                            className={
                              p.status === 'Concluído'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-[#0ABFBC] text-white hover:bg-[#09aba8]'
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
