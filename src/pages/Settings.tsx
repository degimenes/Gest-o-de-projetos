import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default function Settings() {
  const { user, margemCritica, setMargemCritica } = useApp()
  const [localMargem, setLocalMargem] = useState(margemCritica)
  const { toast } = useToast()

  if (user?.role !== 'Gestor' && user?.role !== 'Diretoria') {
    return <Navigate to="/dashboard" replace />
  }

  const handleSave = () => {
    setMargemCritica(localMargem)
    toast({
      title: 'Configurações Salvas',
      description: 'O limite crítico de margem foi atualizado com sucesso.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-[#0ABFBC]" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações Globais</h1>
          <p className="text-sm text-slate-500">Ajustes gerais do sistema e limites de alerta.</p>
        </div>
      </div>

      <Card className="max-w-md shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros de Risco</CardTitle>
          <CardDescription>
            Defina o limite percentual que determina se um projeto está em estado de alerta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="margem">Margem Crítica (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="margem"
                type="number"
                value={localMargem}
                onChange={(e) => setLocalMargem(Number(e.target.value))}
                className="w-24 font-mono"
                min={0}
                max={100}
                step={0.1}
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Projetos com Margem Líquida abaixo de {localMargem}% serão sinalizados em vermelho nas
              tabelas e dashboards.
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="w-full bg-[#0F2044] hover:bg-[#1a3266] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
