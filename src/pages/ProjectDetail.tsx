import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { mockProjects } from '@/lib/mock-data'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Project, Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  Send,
  Clock,
  User as UserIcon,
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const found = mockProjects.find((p) => p.id === id)
    if (found) {
      setProject(found)
      setComments(found.comments || [])
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

    setComments([...comments, comment])
    setNewComment('')
    toast({ title: 'Comentário adicionado com sucesso.' })
  }

  const { baseFinancials: bf, financials: f } = project
  const isCritical = f.margemLiquidaPercent < 15

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge variant="outline" className="bg-white">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">
              {project.id}
            </span>
            <span>•</span>
            <UserIcon className="h-3.5 w-3.5" />
            {project.managerName}
          </p>
        </div>
      </div>

      {isCritical && (
        <Alert
          variant="destructive"
          className="bg-red-50 text-red-900 border-red-200 shadow-sm animate-in slide-in-from-top-2"
        >
          <AlertTriangle className="h-5 w-5 !text-red-600" />
          <AlertTitle className="text-red-800 font-bold">Atenção: Margem Crítica</AlertTitle>
          <AlertDescription className="text-red-700 mt-1">
            Este projeto está com margem líquida inferior à meta de 15% (Atual:{' '}
            <strong className="text-red-900">{f.margemLiquidaPercent.toFixed(1)}%</strong>). Por
            favor, adicione uma justificativa técnica ou plano de ação nos comentários abaixo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Col: Financial Data */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">DRE Sintética (Visualização Odoo)</CardTitle>
              <CardDescription>Detalhamento financeiro extraído em tempo real.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {/* Receitas Brutas */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                    Receitas Brutas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Venda de Produtos (bal[3.1.1.01])</span>
                      <span className="font-mono">{formatCurrency(bf.receitaProduto)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Venda de Serviços (bal[3.1.1.02])</span>
                      <span className="font-mono">{formatCurrency(bf.receitaServico)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Valor Bruto Total</span>
                      <span className="font-mono text-slate-900">{formatCurrency(f.vBruto)}</span>
                    </div>
                  </div>
                </div>

                {/* Deduções */}
                <div className="p-6 bg-red-50/20">
                  <h3 className="text-sm font-semibold text-red-900 mb-4 uppercase tracking-wider">
                    Deduções sobre Receita Bruta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-red-700">
                      <span>PIS s/ Serviços (com créditos)</span>
                      <span className="font-mono">-{formatCurrency(f.pis)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-700">
                      <span>COFINS s/ Serviços (com créditos)</span>
                      <span className="font-mono">-{formatCurrency(f.cofins)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t text-red-800">
                      <span>Total Deduções</span>
                      <span className="font-mono">-{formatCurrency(f.deducoes)}</span>
                    </div>
                  </div>
                </div>

                {/* Receita Líquida */}
                <div className="p-6 bg-slate-50">
                  <div className="flex justify-between font-bold text-lg text-slate-900">
                    <span>Receita Líquida</span>
                    <span className="font-mono text-[#0ABFBC]">{formatCurrency(f.rLiquida)}</span>
                  </div>
                </div>

                {/* Custos */}
                <div className="p-6 bg-amber-50/20">
                  <h3 className="text-sm font-semibold text-amber-900 mb-4 uppercase tracking-wider">
                    Custos Operacionais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-amber-800">
                      <span>Custo Mão de Obra (balp[] hr)</span>
                      <span className="font-mono">-{formatCurrency(bf.custoMaoDeObra)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-800">
                      <span>Custos Materiais</span>
                      <span className="font-mono">-{formatCurrency(bf.custoMateriais)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-800">
                      <span>Custos Serviços</span>
                      <span className="font-mono">-{formatCurrency(bf.custoServicos)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-amber-800">
                      <span>Despesas Administrativas (bal[5.%])</span>
                      <span className="font-mono">-{formatCurrency(bf.despesasAdm)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t text-amber-900">
                      <span>Total Custos e Despesas</span>
                      <span className="font-mono">-{formatCurrency(f.cVendasTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                <div className={`p-6 ${isCritical ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span className={isCritical ? 'text-red-900' : 'text-emerald-900'}>
                      Resultado Final (Margem)
                    </span>
                    <span
                      className={`font-mono ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}
                    >
                      {formatCurrency(f.mLiquida)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isCritical ? 'text-red-700' : 'text-emerald-700'}>
                      Margem Líquida %
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${isCritical ? 'bg-red-200 text-red-900' : 'bg-emerald-200 text-emerald-900'}`}
                    >
                      {f.margemLiquidaPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Comments */}
        <div className="xl:col-span-1">
          <Card className="h-[calc(100vh-10rem)] sticky top-24 flex flex-col shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0F2044]" />
                <CardTitle className="text-lg">Anotações do Projeto</CardTitle>
              </div>
              <CardDescription>Registro persistente de justificativas e notas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {comments.length === 0 ? (
                <div className="text-center text-slate-400 py-8 flex flex-col items-center">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhum comentário registrado.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2 animate-in fade-in zoom-in-95"
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
                        {new Date(comment.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </CardContent>
            <div className="p-4 border-t bg-white shrink-0">
              <div className="space-y-3">
                <Textarea
                  placeholder="Adicione um comentário, justificativa ou plano de ação..."
                  className="min-h-[100px] resize-none focus-visible:ring-[#0ABFBC]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  onClick={handleAddComment}
                  className="w-full bg-[#0F2044] hover:bg-[#1a3266] text-white"
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Registrar Comentário
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
