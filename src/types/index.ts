export type UserRole = 'Gerente' | 'Coordenador' | 'Gestor' | 'Diretoria'

export interface User {
  id: string
  name: string
  role: UserRole
  avatar: string
}

export interface BaseFinancials {
  receitaProduto: number
  receitaServico: number
  custoMateriais: number
  custoServicos: number
  custoMaoDeObra: number
  despesasAdm: number
}

export interface CalculatedFinancials {
  vBruto: number
  pis: number
  cofins: number
  deducoes: number
  rLiquida: number
  mBruta: number
  margemBrutaPercent: number
  cVendasTotal: number
  mLiquida: number
  margemLiquidaPercent: number
}

export interface Comment {
  id: string
  authorName: string
  authorAvatar: string
  content: string
  timestamp: string
}

export interface Project {
  id: string
  name: string
  managerId: string
  managerName: string
  status: 'Em Andamento' | 'Concluído' | 'Pausado'
  startDate: string
  baseFinancials: BaseFinancials
  financials: CalculatedFinancials
  comments: Comment[]
}
