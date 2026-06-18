migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'debora_lopes@grupoepa.com.br')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      const user = new Record(users)
      user.setEmail('debora_lopes@grupoepa.com.br')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Débora Lopes')
      app.save(user)
    }

    try {
      app.findFirstRecordByFilter('settings', '1=1')
    } catch (_) {
      const settings = app.findCollectionByNameOrId('settings')
      const s = new Record(settings)
      s.set('iss_rate', 5)
      s.set('csll_rate', 9)
      s.set('irpj_rate', 15)
      s.set('margem_critica_pct', 15)
      app.save(s)
    }

    const count = app.countRecords('projects')
    if (count === 0) {
      const projCol = app.findCollectionByNameOrId('projects')
      const data = [
        {
          nome_projeto: 'Implementação ERP Odoo',
          id_gerente: 'gerente_1',
          nome_gerente: 'Carlos Silva',
          status: 'Em Andamento',
          receita_venda_produto: 50000,
          receita_venda_servico: 150000,
          custos_materiais: 20000,
          custos_servicos: 30000,
          custo_mao_de_obra: 40000,
          despesas_adm: 10000,
        },
        {
          nome_projeto: 'Upgrade Infraestrutura de Redes',
          id_gerente: 'gerente_1',
          nome_gerente: 'Carlos Silva',
          status: 'Concluído',
          receita_venda_produto: 120000,
          receita_venda_servico: 40000,
          custos_materiais: 30000,
          custos_servicos: 10000,
          custo_mao_de_obra: 20000,
          despesas_adm: 5000,
        },
        {
          nome_projeto: 'Migração Cloud AWS',
          id_gerente: 'gestor_1',
          nome_gerente: 'Ana Diretora',
          status: 'Em Andamento',
          receita_venda_produto: 0,
          receita_venda_servico: 200000,
          custos_materiais: 0,
          custos_servicos: 80000,
          custo_mao_de_obra: 60000,
          despesas_adm: 20000,
        },
        {
          nome_projeto: 'Consultoria de BI',
          id_gerente: 'coord_1',
          nome_gerente: 'João Coordenador',
          status: 'Em Andamento',
          receita_venda_produto: 0,
          receita_venda_servico: 100000,
          custos_materiais: 0,
          custos_servicos: 20000,
          custo_mao_de_obra: 50000,
          despesas_adm: 10000,
        },
        {
          nome_projeto: 'Desenvolvimento App Mobile',
          id_gerente: 'gerente_1',
          nome_gerente: 'Carlos Silva',
          status: 'Pausado',
          receita_venda_produto: 10000,
          receita_venda_servico: 150000,
          custos_materiais: 5000,
          custos_servicos: 40000,
          custo_mao_de_obra: 70000,
          despesas_adm: 15000,
        },
        {
          nome_projeto: 'Auditoria de Segurança',
          id_gerente: 'gestor_1',
          nome_gerente: 'Ana Diretora',
          status: 'Concluído',
          receita_venda_produto: 0,
          receita_venda_servico: 80000,
          custos_materiais: 0,
          custos_servicos: 10000,
          custo_mao_de_obra: 30000,
          despesas_adm: 5000,
        },
        {
          nome_projeto: 'Integração de APIs',
          id_gerente: 'coord_1',
          nome_gerente: 'João Coordenador',
          status: 'Em Andamento',
          receita_venda_produto: 20000,
          receita_venda_servico: 90000,
          custos_materiais: 5000,
          custos_servicos: 15000,
          custo_mao_de_obra: 35000,
          despesas_adm: 8000,
        },
        {
          nome_projeto: 'Manutenção de Sistemas',
          id_gerente: 'gerente_1',
          nome_gerente: 'Carlos Silva',
          status: 'Em Andamento',
          receita_venda_produto: 0,
          receita_venda_servico: 50000,
          custos_materiais: 0,
          custos_servicos: 5000,
          custo_mao_de_obra: 20000,
          despesas_adm: 5000,
        },
      ]
      for (const d of data) {
        const p = new Record(projCol)
        for (const k in d) p.set(k, d[k])
        app.save(p)
      }
    }
  },
  (app) => {
    try {
      const pCol = app.findCollectionByNameOrId('projects')
      app.truncateCollection(pCol)
    } catch (_) {}
    try {
      const sCol = app.findCollectionByNameOrId('settings')
      app.truncateCollection(sCol)
    } catch (_) {}
  },
)
