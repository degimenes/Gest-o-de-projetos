import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { User, Project } from '@/types'
import { mockUsers, mockProjects } from '@/lib/mock-data'

interface AppContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  user: User | null
  setUser: (user: User | null) => void
  margemCritica: number
  setMargemCritica: (val: number) => void
  issPadrao: number
  setIssPadrao: (val: number) => void
  csll: number
  setCsll: (val: number) => void
  irpj: number
  setIrpj: (val: number) => void
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  // Start with no user to force login
  const [user, setUser] = useState<User | null>(null)
  const [margemCritica, setMargemCritica] = useState(15)
  const [issPadrao, setIssPadrao] = useState(5)
  const [csll, setCsll] = useState(9)
  const [irpj, setIrpj] = useState(15)
  const [users, setUsers] = useState<User[]>(mockUsers)
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
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          setProjects(mockProjects)
        } else {
          // Simulate database connection fetch to Odoo PostgreSQL
          const response = await fetch('/api/odoo/projects').catch(() => null)
          if (response?.ok) {
            const data = await response.json()
            setProjects(data)
          } else {
            console.warn('Odoo integration not available. Returning empty.')
            setProjects([])
          }
        }
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    }
  }, [user])

  const triggerSync = async () => {
    setIsSyncing(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLastSyncDate(new Date().toLocaleString('pt-BR'))
        setNextSyncDate(new Date(Date.now() + 86400000).toLocaleString('pt-BR'))
        setIsSyncing(false)
        resolve()
      }, 2000)
    })
  }

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        user,
        setUser,
        margemCritica,
        setMargemCritica,
        issPadrao,
        setIssPadrao,
        csll,
        setCsll,
        irpj,
        setIrpj,
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
