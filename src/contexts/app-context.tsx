import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { User, Project } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { getSettings, updateSettings } from '@/services/settings'
import { getProjects } from '@/services/projects'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { calculateFinancials } from '@/lib/financial'
import pb from '@/lib/pocketbase/client'

interface AppContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  user: User | null
  setUser: (user: User | null) => void

  settingsId: string
  margemCritica: number
  issPadrao: number
  csll: number
  irpj: number

  saveSettings: (params: {
    margemCritica: number
    issPadrao: number
    csll: number
    irpj: number
  }) => Promise<void>

  lastSyncDate: string
  nextSyncDate: string
  isSyncing: boolean
  triggerSync: () => Promise<void>
  users: User[]
  setUsers: (users: User[]) => void
  isLoading: boolean
  projects: Project[]
  setProjects: (projects: Project[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated } = useAuth()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [user, setUser] = useState<User | null>(null)

  const handleSetUser = (u: User | null) => {
    if (u === null && isAuthenticated) {
      pb.authStore.clear()
    }
    setUser(u)
  }

  const [settingsId, setSettingsId] = useState('')
  const [margemCritica, setMargemCritica] = useState(15)
  const [issPadrao, setIssPadrao] = useState(5)
  const [csll, setCsll] = useState(9)
  const [irpj, setIrpj] = useState(15)

  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [lastSyncDate, setLastSyncDate] = useState(
    new Date(Date.now() - 3600000).toLocaleString('pt-BR'),
  )
  const [nextSyncDate, setNextSyncDate] = useState(
    new Date(Date.now() + 86400000 - 3600000).toLocaleString('pt-BR'),
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.name || authUser.email,
        role: 'Gestor',
        avatar:
          authUser.avatar ||
          `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${authUser.id}`,
      })
    } else {
      setUser(null)
    }
  }, [authUser])

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const uRecords = await getUsers().catch(() => [])
      setUsers(
        uRecords.map((u) => ({
          id: u.id,
          name: u.name || u.email,
          role: 'Gestor',
          avatar: u.avatar || `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${u.id}`,
        })),
      )

      const st = await getSettings().catch(() => null)
      if (st) {
        setSettingsId(st.id)
        setMargemCritica(st.margem_critica_pct)
        setIssPadrao(st.iss_rate)
        setCsll(st.csll_rate)
        setIrpj(st.irpj_rate)
      }

      const pRecords = await getProjects().catch(() => [])

      const stRates = st
        ? { issRate: st.iss_rate, csllRate: st.csll_rate, irpjRate: st.irpj_rate }
        : undefined

      const mappedProjects: Project[] = pRecords.map((p) => {
        const base = {
          receitaProduto: p.receita_venda_produto,
          receitaServico: p.receita_venda_servico,
          custoMateriais: p.custos_materiais,
          custoServicos: p.custos_servicos,
          custoMaoDeObra: p.custo_mao_de_obra,
          despesasAdm: p.despesas_adm,
        }
        return {
          id: p.id,
          name: p.nome_projeto,
          managerId: p.id_gerente,
          managerName: p.nome_gerente,
          status: p.status as 'Em Andamento' | 'Concluído' | 'Pausado',
          startDate: p.created,
          baseFinancials: base,
          financials: calculateFinancials(base, stRates),
          comments: [],
        }
      })
      setProjects(mappedProjects)
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isAuthenticated])

  useRealtime(
    'settings',
    () => {
      loadData()
    },
    isAuthenticated,
  )
  useRealtime(
    'projects',
    () => {
      loadData()
    },
    isAuthenticated,
  )

  const saveSettings = async (params: {
    margemCritica: number
    issPadrao: number
    csll: number
    irpj: number
  }) => {
    if (!settingsId) return
    await updateSettings(settingsId, {
      margem_critica_pct: params.margemCritica,
      iss_rate: params.issPadrao,
      csll_rate: params.csll,
      irpj_rate: params.irpj,
    })
  }

  const triggerSync = async () => {
    setIsSyncing(true)
    try {
      await pb.send('/backend/v1/sync-odoo', { method: 'POST' })
      setLastSyncDate(new Date().toLocaleString('pt-BR'))
      setNextSyncDate(new Date(Date.now() + 86400000).toLocaleString('pt-BR'))
      await loadData()
    } catch (err: any) {
      console.error('Failed to sync with Odoo:', err)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        user,
        setUser: handleSetUser,
        settingsId,
        margemCritica,
        issPadrao,
        csll,
        irpj,
        saveSettings,
        lastSyncDate,
        nextSyncDate,
        isSyncing,
        triggerSync,
        users,
        setUsers,
        isLoading,
        projects,
        setProjects,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
