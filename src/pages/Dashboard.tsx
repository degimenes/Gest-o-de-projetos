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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { isLoading, margemCritica, projects: appProjects } = useApp()
  const projects = appProjects.map((p) => ({
    id: p.id,
    name: p.name,
    manager: p.managerName,
    receita: p.financials.rLiquida,
    custo: p.financials.cVendasTotal,
    lucro: p.financials.mLiquida,
    margem: p.financials.margemLiquidaPercent,
    status: p.status,
  }))

  const chartData = projects.map((p) => ({
    name: p.name.substring(0, 15) + '...',
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Geral</h2>
        <p className="text-slate-500 text-sm">
          Visão consolidada do portfólio de projetos ativos e concluídos.
        </p>
      </div>

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
                          <span
                            className={cn(
                              'font-semibold',
                              p.margem < margemCritica ? 'text-red-600' : 'text-emerald-600',
                            )}
                          >
                            {p.margem}%
                          </span>
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
