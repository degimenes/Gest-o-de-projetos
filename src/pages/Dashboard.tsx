import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { mockProjects } from '@/lib/mock-data'
import { MARGEM_CRITICA_PCT } from '@/lib/config'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function Dashboard() {
  const { user, dateRange } = useApp()
  const navigate = useNavigate()
  const [selectedManager, setSelectedManager] = useState<string>('all')

  if (user?.role === 'Gerente' || user?.role === 'Coordenador') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900">Acesso Negado</h2>
        <p>Seu perfil ({user.role}) não tem permissão para acessar o Dashboard Geral.</p>
      </div>
    )
  }

  const filteredProjects = useMemo(() => {
    let projs = mockProjects

    if (dateRange?.from && dateRange?.to) {
      projs = projs.filter((p) => {
        const d = new Date(p.startDate)
        // Normalize time to midnight for comparison
        d.setHours(0, 0, 0, 0)
        const from = new Date(dateRange.from!)
        from.setHours(0, 0, 0, 0)
        const to = new Date(dateRange.to!)
        to.setHours(23, 59, 59, 999)
        return d >= from && d <= to
      })
    }

    if (selectedManager !== 'all') {
      projs = projs.filter((p) => p.managerId === selectedManager)
    }

    return projs
  }, [selectedManager, dateRange])

  const activeProjects = filteredProjects.filter((p) => p.status === 'Em Andamento').length
  const totalRevenue = filteredProjects.reduce((acc, p) => acc + p.financials.vBruto, 0)

  const avgGrossMargin = filteredProjects.length
    ? filteredProjects.reduce((acc, p) => acc + p.financials.margemBrutaPercent, 0) /
      filteredProjects.length
    : 0

  const avgNetMargin = filteredProjects.length
    ? filteredProjects.reduce((acc, p) => acc + p.financials.margemLiquidaPercent, 0) /
      filteredProjects.length
    : 0

  const chartData = useMemo(() => {
    return [...filteredProjects]
      .sort((a, b) => b.financials.margemLiquidaPercent - a.financials.margemLiquidaPercent)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        margemLiquidaPercent: p.financials.margemLiquidaPercent,
      }))
  }, [filteredProjects])

  const tableData = useMemo(() => {
    return [...filteredProjects].sort(
      (a, b) => a.financials.margemLiquidaPercent - b.financials.margemLiquidaPercent,
    )
  }, [filteredProjects])

  const managers = useMemo(() => {
    const map = new Map<string, string>()
    mockProjects.forEach((p) => map.set(p.managerId, p.managerName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Geral</h1>
          <p className="text-sm text-slate-500">Visão consolidada do portfólio de projetos.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger className="w-[220px] bg-white">
              <SelectValue placeholder="Filtrar por Gerente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Gerentes</SelectItem>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Faturamento Bruto Total (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0ABFBC]">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Margem Bruta Média (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{avgGrossMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Margem Líquida Média (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${avgNetMargin < MARGEM_CRITICA_PCT ? 'text-red-600' : 'text-slate-900'}`}
            >
              {avgNetMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Top 10 Projetos por Margem Líquida (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ChartContainer
              config={{
                margemLiquidaPercent: {
                  label: 'Margem Líquida (%)',
                },
              }}
              className="h-full w-full"
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="margemLiquidaPercent" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.margemLiquidaPercent >= MARGEM_CRITICA_PCT ? '#10b981' : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Detalhamento de Projetos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[250px]">Projeto</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead className="text-right">Faturamento Bruto</TableHead>
                  <TableHead className="text-right">Margem Bruta %</TableHead>
                  <TableHead className="text-right">Margem Líquida %</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((project) => {
                  const f = project.financials
                  const isCritical = f.margemLiquidaPercent < MARGEM_CRITICA_PCT
                  return (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/projeto/${project.id}`)}
                    >
                      <TableCell className="font-medium text-slate-900">{project.name}</TableCell>
                      <TableCell className="text-slate-600">{project.managerName}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(f.vBruto)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {f.margemBrutaPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={isCritical ? 'text-red-600 font-bold' : 'text-slate-900'}>
                          {f.margemLiquidaPercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center" title={isCritical ? 'Alerta' : 'OK'}>
                          {isCritical ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Nenhum projeto encontrado para o filtro atual.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
