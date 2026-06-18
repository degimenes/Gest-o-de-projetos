import { Project } from '@/types'
import { calculateFinancials } from './financial'

// Use dynamic dates so they fall within the default -30 days window
const today = new Date()
const daysAgo = (days: number) =>
  new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

const rawProjects = [
  {
    id: 'PRJ-2026-001',
    name: 'Implementação ERP Odoo',
    managerId: 'gerente_1',
    managerName: 'Carlos Silva',
    status: 'Em Andamento' as const,
    startDate: daysAgo(25),
    baseFinancials: {
      receitaProduto: 50000,
      receitaServico: 150000,
      custoMateriais: 20000,
      custoServicos: 30000,
      custoMaoDeObra: 60000,
      despesasAdm: 10000,
    },
    comments: [
      {
        id: 'c1',
        authorName: 'Ana Souza',
        authorAvatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
        content: 'Alocação extra de horas aprovada para a fase 2.',
        timestamp: '2026-06-15T14:30:00Z',
      },
    ],
  },
  {
    id: 'PRJ-2026-002',
    name: 'Migração Cloud AWS',
    managerId: 'gerente_1',
    managerName: 'Carlos Silva',
    status: 'Em Andamento' as const,
    startDate: daysAgo(20),
    baseFinancials: {
      receitaProduto: 0,
      receitaServico: 200000,
      custoMateriais: 50000,
      custoServicos: 80000,
      custoMaoDeObra: 40000,
      despesasAdm: 15000,
    },
    comments: [
      {
        id: 'c2',
        authorName: 'Carlos Silva',
        authorAvatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
        content: 'Custos de infraestrutura aumentaram devido ao câmbio. Margem em risco.',
        timestamp: '2026-06-16T09:15:00Z',
      },
    ],
  },
  {
    id: 'PRJ-2026-003',
    name: 'Aplicativo Mobile B2B',
    managerId: 'gerente_2',
    managerName: 'Mariana Costa',
    status: 'Concluído' as const,
    startDate: daysAgo(15),
    baseFinancials: {
      receitaProduto: 0,
      receitaServico: 300000,
      custoMateriais: 10000,
      custoServicos: 20000,
      custoMaoDeObra: 120000,
      despesasAdm: 25000,
    },
    comments: [],
  },
  {
    id: 'PRJ-2026-004',
    name: 'Data Lake Analytics',
    managerId: 'gerente_2',
    managerName: 'Mariana Costa',
    status: 'Em Andamento' as const,
    startDate: daysAgo(10),
    baseFinancials: {
      receitaProduto: 80000,
      receitaServico: 120000,
      custoMateriais: 60000,
      custoServicos: 40000,
      custoMaoDeObra: 70000,
      despesasAdm: 12000,
    },
    comments: [],
  },
  {
    id: 'PRJ-2026-005',
    name: 'Auditoria de Segurança',
    managerId: 'gerente_1',
    managerName: 'Carlos Silva',
    status: 'Pausado' as const,
    startDate: daysAgo(5),
    baseFinancials: {
      receitaProduto: 0,
      receitaServico: 90000,
      custoMateriais: 5000,
      custoServicos: 10000,
      custoMaoDeObra: 45000,
      despesasAdm: 5000,
    },
    comments: [],
  },
]

export const mockProjects: Project[] = rawProjects.map((p) => ({
  ...p,
  financials: calculateFinancials(p.baseFinancials),
}))
