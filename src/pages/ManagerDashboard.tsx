import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
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
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function ManagerDashboard() {
  const { user, dateRange } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const urlManagerId = searchParams.get('id')

  useEffect(() => {
    if (user && (user.role === 'Gerente' || user.role === 'Coordenador')) {
      if (urlManagerId !== user.id) {
        setSearchParams({ id: user.id }, { replace: true })
      }
    } else if (user && !urlManagerId) {
      const firstManager = mockProjects[0]?.managerId
      if (firstManager) {
        setSearchParams({ id: firstManager }, { replace: true })
      }
    }
  }, [user, urlManagerId, setSearchParams])

  const selectedManagerId = urlManagerId || user?.id

  const managers = useMemo(() => {
    const map = new Map<string, string>()
    mockProjects.forEach((p) => map.set(p.managerId, p.managerName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [])

  const filteredProjects = useMemo(() => {
    if (!selectedManagerId) return []
    let projs = mockProjects.filter((p) => p.managerId === selectedManagerId)

    if (dateRange?.from && dateRange?.to) {
      projs = projs.filter((p) => {
        const d = new Date(p.startDate)
        d.setHours(0, 0, 0, 0)
        const from = new Date(dateRange.from!)
        from.setHours(0, 0, 0, 0)
        const to = new Date(dateRange.to!)
        to.setHours(23, 59, 59, 999)
        return d >= from && d <= to
      })
    }

    return projs
  }, [selectedManagerId, dateRange])

  const selectedManagerName = managers.find((m) => m.id === selectedManagerId)?.name || 'Gerente'

  const totalProjects = filteredProjects.length
  const totalGrossRevenue = filteredProjects.reduce((acc, p) => acc + p.financials.vBruto, 0)

  const avgGrossMargin =
    totalProjects > 0
      ? filteredProjects.reduce((acc, p) => acc + p.financials.margemBrutaPercent, 0) /
        totalProjects
      : 0

  const avgNetMargin =
    totalProjects > 0
      ? filteredProjects.reduce((acc, p) => acc + p.financials.margemLiquidaPercent, 0) /
        totalProjects
      : 0

  const chartData = useMemo(() => {
    const monthlyData: Record<string, { label: string; revenue: number; timestamp: number }> = {}

    filteredProjects.forEach((p) => {
      const d = new Date(p.startDate)
      const monthYearKey = `${d.getFullYear()}-${d.getMonth()}`
      const monthYearLabel = d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })

      if (!monthlyData[monthYearKey]) {
        monthlyData[monthYearKey] = {
          label: monthYearLabel,
          revenue: 0,
          timestamp: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
        }
      }
      monthlyData[monthYearKey].revenue += p.financials.vBruto
    })

    return Object.values(monthlyData)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({ month: item.label, revenue: item.revenue }))
  }, [filteredProjects])

  const tableData = useMemo(() => {
    return [...filteredProjects].sort(
      (a, b) => b.financials.margemLiquidaPercent - a.financials.margemLiquidaPercent,
    )
  }, [filteredProjects])

  const canSelectManager = user?.role === 'Gestor' || user?.role === 'Diretoria'

  const handleExport = (type: string) => {
    toast({
      title: 'Exportação Iniciada',
      description: `Gerando arquivo ${type} com a visão do gerente ${selectedManagerName}...`,
    })
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Visão do Gerente: <span className="text-[#0ABFBC]">{selectedManagerName}</span>
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhamento de performance de portfólio individual.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {canSelectManager && (
            <Select
              value={selectedManagerId || ''}
              onValueChange={(val) => setSearchParams({ id: val })}
            >
              <SelectTrigger className="w-[220px] bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="Selecione um gerente" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 bg-white shadow-sm hover:bg-slate-50"
              onClick={() => handleExport('Excel')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
              Exportar Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 bg-white shadow-sm hover:bg-slate-50"
              onClick={() => handleExport('PDF')}
            >
              <Download className="h-4 w-4 mr-2 text-red-600" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Faturamento Bruto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0ABFBC]">
              {formatCurrency(totalGrossRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Margem Bruta Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{avgGrossMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Margem Líquida Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${avgNetMargin < MARGEM_CRITICA_PCT ? 'text-red-600' : 'text-emerald-600'}`}
            >
              {avgNetMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Evolução Mensal de Faturamento Bruto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  revenue: {
                    label: 'Faturamento Bruto',
                    color: '#0ABFBC',
                  },
                }}
                className="h-full w-full"
              >
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ABFBC"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0ABFBC', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#0F2044', stroke: '#0ABFBC' }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Sem dados para o período filtrado
              </div>
            )}
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
                  <TableHead className="text-right">Faturamento Bruto</TableHead>
                  <TableHead className="text-right">Receita Líquida</TableHead>
                  <TableHead className="text-right">Margem Bruta (R$)</TableHead>
                  <TableHead className="text-right">Margem Bruta (%)</TableHead>
                  <TableHead className="text-right">Margem Líquida (%)</TableHead>
                  <TableHead className="text-center">Alerta</TableHead>
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
                      <TableCell className="text-right font-mono text-slate-600">
                        {formatCurrency(f.vBruto)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-600">
                        {formatCurrency(f.rLiquida)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-600">
                        {formatCurrency(f.mBruta)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-600">
                        {f.margemBrutaPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span
                          className={
                            isCritical ? 'text-red-600 font-bold' : 'text-emerald-600 font-semibold'
                          }
                        >
                          {f.margemLiquidaPercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className="flex justify-center"
                          title={isCritical ? 'Abaixo da Meta' : 'OK'}
                        >
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
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Nenhum projeto encontrado.
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
