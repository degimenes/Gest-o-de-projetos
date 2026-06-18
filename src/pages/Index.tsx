import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { mockProjects } from '@/lib/mock-data'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ArrowDownRight, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react'

export default function Index() {
  const { user } = useApp()
  const navigate = useNavigate()

  // Filter based on RBAC rule
  const visibleProjects = useMemo(() => {
    if (user?.role === 'Gerente') {
      return mockProjects.filter((p) => p.managerId === user.id)
    }
    return mockProjects
  }, [user])

  // Calculate Global KPIs
  const kpis = useMemo(() => {
    const totalVBruto = visibleProjects.reduce((acc, p) => acc + p.financials.vBruto, 0)
    const totalRLiquida = visibleProjects.reduce((acc, p) => acc + p.financials.rLiquida, 0)
    const totalMLiquida = visibleProjects.reduce((acc, p) => acc + p.financials.mLiquida, 0)
    const avgMargemPercent = totalRLiquida > 0 ? (totalMLiquida / totalRLiquida) * 100 : 0

    return { totalVBruto, totalRLiquida, totalMLiquida, avgMargemPercent }
  }, [visibleProjects])

  // Data for Ranking Chart (Bar)
  const rankingData = useMemo(() => {
    return [...visibleProjects]
      .sort((a, b) => b.financials.margemLiquidaPercent - a.financials.margemLiquidaPercent)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        margin: parseFloat(p.financials.margemLiquidaPercent.toFixed(1)),
        isCritical: p.financials.margemLiquidaPercent < 15,
      }))
  }, [visibleProjects])

  // Data for Cost Composition (Pie)
  const costData = useMemo(() => {
    const maoDeObra = visibleProjects.reduce((acc, p) => acc + p.baseFinancials.custoMaoDeObra, 0)
    const materiaisServicos = visibleProjects.reduce(
      (acc, p) => acc + p.baseFinancials.custoMateriais + p.baseFinancials.custoServicos,
      0,
    )
    const despAdm = visibleProjects.reduce((acc, p) => acc + p.baseFinancials.despesasAdm, 0)

    return [
      { name: 'Mão de Obra', value: maoDeObra, fill: 'hsl(var(--chart-1))' },
      { name: 'Mat. e Serviços', value: materiaisServicos, fill: 'hsl(var(--chart-2))' },
      { name: 'Desp. ADM', value: despAdm, fill: 'hsl(var(--chart-3))' },
    ]
  }, [visibleProjects])

  // Mock data for Evolution Area Chart
  const evolutionData = [
    { name: 'Jan', receita: 120000, custo: 90000 },
    { name: 'Fev', receita: 150000, custo: 100000 },
    { name: 'Mar', receita: 180000, custo: 110000 },
    { name: 'Abr', receita: 220000, custo: 140000 },
    { name: 'Mai', receita: 280000, custo: 160000 },
    { name: 'Jun', receita: kpis.totalRLiquida, custo: kpis.totalRLiquida - kpis.totalMLiquida },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Visão Geral {user?.role === 'Gerente' && '- Meus Projetos'}
        </h2>
      </div>

      {/* KPI Ribbon */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Valor Bruto da Venda
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalVBruto)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              +5.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Receita Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalRLiquida)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Após dedução de impostos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">
              Margem Líquida (R$)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalMLiquida)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Lucro operacional dos projetos</p>
          </CardContent>
        </Card>
        <Card className={kpis.avgMargemPercent < 15 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Margem Líquida (%)</CardTitle>
            {kpis.avgMargemPercent < 15 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                kpis.avgMargemPercent < 15 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {kpis.avgMargemPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              {kpis.avgMargemPercent < 15 ? (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  Abaixo da meta (15%)
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                  Acima da meta (15%)
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução de Faturamento vs Custos</CardTitle>
            <CardDescription>Consolidado dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                receita: { label: 'Receita', color: 'hsl(var(--chart-2))' },
                custo: { label: 'Custos', color: 'hsl(var(--chart-1))' },
              }}
              className="h-[300px] w-full"
            >
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                />
                <Area
                  type="monotone"
                  dataKey="custo"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorCusto)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Composição de Custos</CardTitle>
            <CardDescription>Distribuição de despesas operacionais</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <ChartContainer
              config={{
                value: { label: 'Valor' },
              }}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Ranking Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ranking de Margem (%)</CardTitle>
            <CardDescription>Top projetos por rentabilidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ margin: { label: 'Margem %' } }} className="h-[300px] w-full">
              <BarChart layout="vertical" data={rankingData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={20}>
                  {rankingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCritical ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Detalhamento de Projetos</CardTitle>
            <CardDescription>Clique em um projeto para ver a DRE completa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Gerente</TableHead>
                    <TableHead className="text-right">Valor Bruto</TableHead>
                    <TableHead className="text-right">Margem Líquida</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors group"
                      onClick={() => navigate(`/projeto/${project.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        {project.id}
                      </TableCell>
                      <TableCell className="font-medium group-hover:text-[#0ABFBC] transition-colors">
                        {project.name}
                      </TableCell>
                      <TableCell className="text-slate-600">{project.managerName}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(project.financials.vBruto)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono font-medium text-sm ${project.financials.margemLiquidaPercent < 15 ? 'text-red-600' : 'text-emerald-600'}`}
                      >
                        {project.financials.margemLiquidaPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {project.financials.margemLiquidaPercent < 15 ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none"
                          >
                            Crítico
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none"
                          >
                            Saudável
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
