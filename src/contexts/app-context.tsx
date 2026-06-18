import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { User } from '@/types'

interface AppContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  user: User | null
  setUser: (user: User | null) => void
  margemCritica: number
  setMargemCritica: (val: number) => void
  lastSyncDate: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [user, setUser] = useState<User | null>({
    id: 'gestor_1',
    name: 'Ana Diretora',
    role: 'Gestor',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
  })

  const [margemCritica, setMargemCritica] = useState(15)
  const lastSyncDate = new Date(Date.now() - 3600000).toLocaleString('pt-BR')

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        user,
        setUser,
        margemCritica,
        setMargemCritica,
        lastSyncDate,
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
