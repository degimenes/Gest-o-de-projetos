import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCombobox } from '@/components/project-combobox'
import { LiveProjectFinancials } from '@/components/live-project-financials'

export default function Diagnostic() {
  const [code, setCode] = useState('')

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Diagnóstico Odoo</h2>
        <p className="text-slate-500 text-sm">
          Consulte as linhas financeiras e de apontamentos de um projeto diretamente do Odoo em
          tempo real.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <ProjectCombobox value={code} onChange={setCode} />
          </div>
        </CardContent>
      </Card>

      {code && <LiveProjectFinancials code={code} />}
    </div>
  )
}
