import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { User } from '@/types'

interface AppContextType {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  user: User | null
  setUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const [user, setUser] = useState<User | null>({
    id: 'gerente_1',
    name: 'Carlos Silva',
    role: 'Gerente',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  })

  return (
    <AppContext.Provider value={{ dateRange, setDateRange, user, setUser }}>
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
