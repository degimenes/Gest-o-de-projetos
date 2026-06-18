import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/app-context'
import { DatePickerWithRange } from './date-range-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  LayoutDashboard,
  FolderKanban,
  FileBarChart,
  Settings,
  LogOut,
  Search,
  Download,
  FileSpreadsheet,
} from 'lucide-react'

export function Layout() {
  const { user, setUser, dateRange, setDateRange } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  if (!user) {
    return <Outlet />
  }

  const handleLogout = () => {
    setUser(null)
    navigate('/login')
  }

  const { lastSyncDate } = useApp()

  const handleExport = (type: string) => {
    if (type === 'PDF') {
      const originalTitle = document.title
      document.title = `EPA_Projetos_Layout_${new Date().toISOString().split('T')[0]}`
      window.print()
      document.title = originalTitle
      return
    }
    toast({
      title: `Exportação Iniciada`,
      description: `Gerando arquivo ${type} com a visão atual do dashboard...`,
    })
  }

  const navItems = [
    { name: 'Dashboard Geral', path: '/dashboard', icon: LayoutDashboard },
    {
      name:
        user?.role === 'Gestor' || user?.role === 'Diretoria'
          ? 'Visão por Gerente'
          : 'Meus Projetos',
      path:
        user?.role === 'Gerente' || user?.role === 'Coordenador'
          ? `/gerente?id=${user.id}`
          : '/gerente',
      icon: FolderKanban,
    },
    { name: 'Relatórios', path: '#', icon: FileBarChart },
    ...(user?.role === 'Gestor' || user?.role === 'Diretoria'
      ? [{ name: 'Configurações', path: '/configuracoes', icon: Settings }]
      : []),
  ]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F2044] text-white flex-shrink-0 flex flex-col transition-all duration-300 print:hidden">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-[#0ABFBC]">EPA</span> Projetos
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Business Intelligence
          </p>
        </div>

        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#0ABFBC] text-white">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-medium truncate">{user.name}</p>
            <Badge
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white mt-1 border-none font-normal text-[10px] px-2"
            >
              {user.role}
            </Badge>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const baseItemPath = item.path.split('?')[0]
            const isActive = location.pathname === baseItemPath && baseItemPath !== '#'
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0ABFBC]/10 text-[#0ABFBC]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm print:hidden">
          <div className="flex items-center flex-1 gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar projeto..."
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600"
              onClick={() => handleExport('PDF')}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600"
              onClick={() => handleExport('Excel')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Excel
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] p-6 print:p-0 print:bg-white relative">
          {/* Print Header */}
          <div className="hidden print:flex justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src="https://img.usecurling.com/i?q=chart&color=azure&shape=fill"
                alt="EPA Logo"
                className="h-10 w-10 rounded"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Relatório de Projetos BI</h1>
                <p className="text-sm text-slate-500">
                  Gerado em: {new Date().toLocaleDateString('pt-BR')}{' '}
                  {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Usuário: {user.name}</p>
              <p>Perfil: {user.role}</p>
            </div>
          </div>

          <Outlet />

          {/* Print Footer */}
          <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-xs text-slate-500 pt-4 border-t bg-white">
            Gerado em: {new Date().toLocaleString('pt-BR')} | Dados atualizados em: {lastSyncDate}
          </div>
        </main>
      </div>
    </div>
  )
}
