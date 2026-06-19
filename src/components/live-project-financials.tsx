import { useState, useEffect } from 'react'
import { getDiagnostic } from '@/services/odoo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function LiveProjectFinancials({ code }: { code: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) return
    setLoading(true)
    setError('')
    setData(null)
    getDiagnostic(code)
      .then(setData)
      .catch((err) =>
        setError(err?.data?.message || err?.message || 'Erro ao carregar dados do Odoo.'),
      )
      .finally(() => setLoading(false))
  }, [code])

  if (!code) return null

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        <Skeleton className="h-[120px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Integração</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 mt-6 animate-fade-in border-t pt-6">
      <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-md border border-slate-100">
        <div>
          <strong>Projeto Odoo:</strong> {data.account.name}
        </div>
        <div>
          <strong>Código:</strong> {data.account.code}
        </div>
        <div>
          <strong>ID Interno:</strong> {data.account.id}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none border-slate-200">
          <CardHeader className="py-3 bg-slate-50/50">
            <CardTitle className="text-sm">Linhas de Movimento (Financeiro)</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="max-h-[300px] overflow-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Débito</TableHead>
                    <TableHead className="text-right pr-4">Crédito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.moveLines.slice(0, 50).map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell className="pl-4 whitespace-nowrap">{line.date}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={line.name}>
                        {line.name}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        R$ {Number(line.debit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-4 whitespace-nowrap">
                        R$ {Number(line.credit).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.moveLines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                        Sem dados disponíveis.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader className="py-3 bg-slate-50/50">
            <CardTitle className="text-sm">Linhas Analíticas (Apontamentos)</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="max-h-[300px] overflow-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Data</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead className="text-right">Horas/Qtd</TableHead>
                    <TableHead className="text-right pr-4">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.analyticLines.slice(0, 50).map((line: any) => (
                    <TableRow key={line.id}>
                      <TableCell className="pl-4 whitespace-nowrap">{line.date}</TableCell>
                      <TableCell
                        className="max-w-[150px] truncate"
                        title={line.employee_id ? line.employee_id[1] : '-'}
                      >
                        {line.employee_id ? line.employee_id[1] : '-'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {Number(line.unit_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-4 whitespace-nowrap">
                        R$ {Number(Math.abs(line.amount)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.analyticLines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                        Sem dados disponíveis.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
