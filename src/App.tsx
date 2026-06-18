import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/app-context'
import { AuthProvider } from '@/hooks/use-auth'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import ProjectDetail from './pages/ProjectDetail'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gerente" element={<ManagerDashboard />} />
                <Route path="/projeto/:id" element={<ProjectDetail />} />
                <Route path="/configuracoes" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
