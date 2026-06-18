import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { mockProjects } from '@/lib/mock-data'
import { MARGEM_CRITICA_PCT } from '@/lib/config'
import { formatCurrency } from '@/lib/utils'
import { calculateFinancials } from '@/lib/financial'
import { Project, Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  Send,
  Clock,
  User as UserIcon,
  Download,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'

// Custom tooltip for the waterfall chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = data.range[1] - data.range[0]
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-sm rounded-lg">
        <p className="text-sm font-bold mb-1">{data.name}</p>
        <p className="text-sm text-slate-600">
          Valor:{' '}
          <span className="font-mono font-medium text-slate-900">{formatCurrency(value)}</span>
        </p>
      </div>
    )
  }
  return null
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [issPercent, setIssPercent] = useState<number>(5)

  useEffect(() => {
    const found = mockProjects.find((p) => p.id === id)
    if (found) {
      setProject(found)
      setIssPercent(found.baseFinancials.issPercent ?? 5)

      // Load comments from localStorage to simulate DB persistence (Supabase)
      const stored = localStorage.getItem(`comments-${id}`)
      if (stored) {
        setComments(JSON.parse(stored))
      } else {
        setComments(found.comments || [])
      }
    }
  }, [id])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Projeto não encontrado.</p>
      </div>
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Math.random().toString(),
      authorName: user.name,
      authorAvatar: user.avatar,
      content: newComment,
      timestamp: new Date().toISOString(),
    }

    const updated = [...comments, comment]
    setComments(updated)
    localStorage.setItem(`comments-${id}`, JSON.stringify(updated))
    setNewComment('')
    toast({
      title: 'Anotação salva',
      description: 'O comentário foi registrado com sucesso no histórico.',
    })
  }

  const handlePrint = () => {
    toast({ title: 'Gerando PDF', description: 'Preparando o painel para exportação...' })
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const bf = project.baseFinancials
  const currentBaseFinancials = { ...bf, issPercent }
  const f = calculateFinancials(currentBaseFinancials)

  const isHealthy = f.margemLiquidaPercent >= MARGEM_CRITICA_PCT

  const startDateStr = new Date(project.startDate).toLocaleDateString('pt-BR')
  const todayStr = new Date().toLocaleDateString('pt-BR')

  const waterfallData = [
    { name: 'Bruto', range: [0, f.vBruto], isExpense: false, type: 'total' },
    { name: 'Tributos V.', range: [f.rLiquida, f.vBruto], isExpense: true, type: 'expense' },
    { name: 'Receita Líq.', range: [0, f.rLiquida], isExpense: false, type: 'subtotal' },
    { name: 'Custos Dir.', range: [f.mBruta, f.rLiquida], isExpense: true, type: 'expense' },
    { name: 'Margem Bruta', range: [0, f.mBruta], isExpense: false, type: 'subtotal' },
    {
      name: 'Desp. ADM',
      range: [f.lucroAntesImpostos, f.mBruta],
      isExpense: true,
      type: 'expense',
    },
    {
      name: 'IRPJ/CSLL',
      range: [f.mLiquida, f.lucroAntesImpostos],
      isExpense: true,
      type: 'expense',
    },
    { name: 'Margem Líq.', range: [0, f.mLiquida], isExpense: false, type: 'final' },
  ]

  const getBarColor = (type: string, value: number) => {
    if (type === 'total' || type === 'subtotal') return '#3b82f6'
    if (type === 'expense') return '#ef4444'
    if (type === 'final') return value >= 0 ? '#10b981' : '#ef4444'
    return '#cbd5e1'
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Section 1: Project Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 print:hidden">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-900 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <Badge
                className={
                  isHealthy
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                }
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {isHealthy ? 'SAUDÁVEL' : 'ALERTA'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4" />
                {project.managerName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Período: {startDateStr} - {todayStr}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="bg-[#0F2044] hover:bg-[#1a3266] text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 2: Revenue Calculation Cards */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg text-slate-800">Cálculo de Receita</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-600">Valor Bruto de Venda</span>
              <span className="font-mono font-medium text-lg">{formatCurrency(f.vBruto)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">ISS (%)</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={issPercent}
                  onChange={(e) => setIssPercent(Number(e.target.value))}
                  className="w-20 text-right h-8"
                  min={0}
                  step={0.1}
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-red-600 pl-4 border-l-2 border-red-200">
              <span>ISS Retido</span>
              <span className="font-mono">-{formatCurrency(f.iss)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-red-600 pl-4 border-l-2 border-red-200">
              <span>PIS (1.65%)</span>
              <span className="font-mono">-{formatCurrency(f.pis)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-red-600 pl-4 border-l-2 border-red-200">
              <span>COFINS (7.6%)</span>
              <span className="font-mono">-{formatCurrency(f.cofins)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900 text-lg">Receita Líquida</span>
              <span className="font-mono font-bold text-[#0ABFBC] text-xl">
                {formatCurrency(f.rLiquida)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Results Analysis */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg text-slate-800">Análise de Resultados</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Margem Bruta (R$)</span>
              <span className="font-mono font-medium">{formatCurrency(f.mBruta)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Margem Bruta (%)</span>
              <span className="font-mono font-medium">{f.margemBrutaPercent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Lucro Antes do IR/CSLL</span>
              <span className="font-mono font-medium">{formatCurrency(f.lucroAntesImpostos)}</span>
            </div>
            <div className="flex justify-between items-center pb-1 text-sm text-red-600 pl-4 border-l-2 border-red-200">
              <span>CSLL (9%)</span>
              <span className="font-mono">-{formatCurrency(f.csll)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-sm text-red-600 pl-4 border-l-2 border-red-200">
              <span>IRPJ (15%)</span>
              <span className="font-mono">-{formatCurrency(f.irpj)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-900 text-lg">Total Margem Líquida</span>
              <div className="text-right">
                <div
                  className={`font-mono font-bold text-xl ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {formatCurrency(f.mLiquida)}
                </div>
                <div
                  className={`text-sm font-bold ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {f.margemLiquidaPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Cost Decomposition */}
        <Card className="shadow-sm border-slate-200 md:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg text-slate-800">Decomposição de Custos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-2/3">Categoria</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Custo Mão de Obra</TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    -{formatCurrency(bf.custoMaoDeObra)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Custos de Materiais</TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    -{formatCurrency(bf.custoMateriais)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Custos de Serviços</TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    -{formatCurrency(bf.custoServicos)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Despesas Administrativas (ADM)</TableCell>
                  <TableCell className="text-right font-mono text-slate-600">
                    -{formatCurrency(bf.despesasAdm)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-slate-50 font-bold">
                  <TableCell className="text-slate-900">Total Custo de Vendas</TableCell>
                  <TableCell className="text-right font-mono text-slate-900">
                    -{formatCurrency(f.cVendasTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Section 5: Visualizations */}
        <Card className="shadow-sm border-slate-200 md:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg text-slate-800">
              Composição da Margem (Waterfall)
            </CardTitle>
            <CardDescription>
              Visualização em cascata do Valor Bruto até a Margem Líquida.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full mt-4">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart
                  data={waterfallData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="range" radius={4} maxBarSize={60}>
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.type, entry.range[1])} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Annotations System */}
        <Card className="shadow-sm border-slate-200 md:col-span-2 print:hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#0F2044]" />
              <CardTitle className="text-lg text-slate-800">Histórico e Anotações</CardTitle>
            </div>
            <CardDescription>
              Registro persistente de justificativas, eventos e planos de ação (Simulação de
              Supabase).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col md:flex-row h-[400px]">
            <div className="flex-1 border-r border-slate-100 p-4 bg-slate-50/30 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma anotação registrada para este projeto.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2 animate-in fade-in zoom-in-95"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback className="text-[10px] bg-[#0F2044] text-white">
                              {comment.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-slate-900">
                            {comment.authorName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(comment.timestamp).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(comment.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pl-8">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full md:w-1/3 p-4 bg-white flex flex-col gap-3 shrink-0 border-t md:border-t-0">
              <h3 className="text-sm font-semibold text-slate-900">Nova Anotação</h3>
              <Textarea
                placeholder="Descreva observações de custos, justificativas de margem ou eventos do projeto..."
                className="flex-1 resize-none focus-visible:ring-[#0ABFBC]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                onClick={handleAddComment}
                className="w-full bg-[#0F2044] hover:bg-[#1a3266] text-white"
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
