import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser, users } = useApp()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple mock authentication enforcing 'admin123'
    if (password !== 'admin123') {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
      return
    }

    const matchedUser =
      users.find((u) => email.toLowerCase().includes(u.role.toLowerCase())) || users[0]

    setUser(matchedUser)

    if (matchedUser.role === 'Gerente' || matchedUser.role === 'Coordenador') {
      navigate(`/gerente?id=${matchedUser.id}`)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="absolute inset-0 bg-[#0F2044] h-[40vh]" />
      <Card className="w-full max-w-md relative z-10 shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto bg-[#0F2044] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-md">
            <span className="text-[#0ABFBC] font-bold text-xl">EPA</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Gestão de Projetos</CardTitle>
          <CardDescription>Faça login para acessar os dashboards financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@epa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Use 'admin123'"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0ABFBC] hover:bg-[#09aba8] text-white mt-4 rounded-md"
            >
              Entrar
            </Button>
            <p className="text-center text-xs text-slate-500 pt-4">
              Cadastro de novos usuários deve ser solicitado ao administrador do sistema.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
