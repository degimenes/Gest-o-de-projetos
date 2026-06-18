import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  UserCog,
  Database,
  ShieldAlert,
  Loader2,
} from 'lucide-react'

export default function Settings() {
  const {
    user,
    margemCritica,
    issPadrao,
    csll,
    irpj,
    saveSettings,
    users,
    lastSyncDate,
    nextSyncDate,
    isSyncing,
    triggerSync,
  } = useApp()

  const [localParams, setLocalParams] = useState({
    margemCritica,
    issPadrao,
    csll,
    irpj,
  })

  useEffect(() => {
    setLocalParams({
      margemCritica,
      issPadrao,
      csll,
      irpj,
    })
  }, [margemCritica, issPadrao, csll, irpj])

  const { toast } = useToast()

  if (user?.role !== 'Gestor' && user?.role !== 'Diretoria') {
    return <Navigate to="/dashboard" replace />
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveParams = async () => {
    setIsSaving(true)
    try {
      await saveSettings({
        margemCritica: localParams.margemCritica,
        issPadrao: localParams.issPadrao,
        csll: localParams.csll,
        irpj: localParams.irpj,
      })
      toast({
        title: 'Configurações Salvas',
        description: 'Os parâmetros financeiros foram atualizados com sucesso no banco de dados.',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSync = async () => {
    await triggerSync()
    toast({
      title: 'Sincronização Concluída',
      description: 'Os dados foram atualizados a partir do Odoo.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-[#0ABFBC]" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações Globais</h1>
          <p className="text-sm text-slate-500">
            Ajustes gerais do sistema, usuários e integrações.
          </p>
        </div>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="pt-4">
          <Card className="max-w-xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-slate-500" />
                Parâmetros e Impostos
              </CardTitle>
              <CardDescription>
                Defina as alíquotas padrão e os limites de alerta que afetam os cálculos de todos os
                projetos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="margem">Margem Crítica (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="margem"
                      type="number"
                      value={localParams.margemCritica}
                      onChange={(e) =>
                        setLocalParams({ ...localParams, margemCritica: Number(e.target.value) })
                      }
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Abaixo deste valor, alertas são gerados.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iss">ISS Padrão (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="iss"
                      type="number"
                      value={localParams.issPadrao}
                      onChange={(e) =>
                        setLocalParams({ ...localParams, issPadrao: Number(e.target.value) })
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csll">CSLL (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csll"
                      type="number"
                      value={localParams.csll}
                      onChange={(e) =>
                        setLocalParams({ ...localParams, csll: Number(e.target.value) })
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="irpj">IRPJ (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="irpj"
                      type="number"
                      value={localParams.irpj}
                      onChange={(e) =>
                        setLocalParams({ ...localParams, irpj: Number(e.target.value) })
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveParams}
                disabled={isSaving}
                className="w-full bg-[#0ABFBC] hover:bg-[#09aba8] text-white rounded-md"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCog className="h-5 w-5 text-slate-500" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>Administre os perfis de acesso da plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />
                          {u.name}
                        </TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-[#0ABFBC]"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            Inativar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="pt-4">
          <Card className="max-w-xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-500" />
                Status da Integração Odoo (ETL)
              </CardTitle>
              <CardDescription>
                Monitore a sincronização de dados financeiros e projetos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Última sincronização</p>
                  <p className="text-sm text-slate-500">{lastSyncDate}</p>
                </div>
                <Badge
                  variant={isSyncing ? 'secondary' : 'default'}
                  className={
                    isSyncing ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }
                >
                  {isSyncing ? 'Sincronizando...' : 'Concluído'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Próxima execução agendada</p>
                  <p className="text-sm text-slate-500">{nextSyncDate}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                className="w-full border-[#0ABFBC] text-[#0ABFBC] hover:bg-[#0ABFBC]/10 rounded-md"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isSyncing ? 'Buscando dados...' : 'Sincronizar agora'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
