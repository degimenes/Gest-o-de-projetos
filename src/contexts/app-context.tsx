import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { User } from '@/types'
import { mockUsers } from '@/lib/mock-data'

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

  const [lastSyncDate, setLastSyncDate] = useState(
    new Date(Date.now() - 3600000).toLocaleString('pt-BR'),
  )
  const [nextSyncDate, setNextSyncDate] = useState(
    new Date(Date.now() + 86400000 - 3600000).toLocaleString('pt-BR'),
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)
      return () => clearTimeout(timer)
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
