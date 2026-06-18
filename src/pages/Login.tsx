import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useApp()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - in reality this would hit Supabase Auth
    setUser({
      id: 'gerente_1',
      name: 'Carlos Silva',
      role: 'Gerente',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="absolute inset-0 bg-[#0F2044] h-[40vh]" />
      <Card className="w-full max-w-md relative z-10 shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto bg-[#0F2044] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-[#0ABFBC] font-bold text-xl">EPA</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Gestão de Projetos</CardTitle>
          <CardDescription>Faça login para acessar os dashboards financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                <a href="#" className="text-xs text-[#0ABFBC] hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0ABFBC] hover:bg-[#09aba8] text-white mt-4"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
