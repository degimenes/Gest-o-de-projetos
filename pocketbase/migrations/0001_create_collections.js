migrate(
  (app) => {
    const projects = new Collection({
      name: 'projects',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome_projeto', type: 'text', required: true },
        { name: 'id_gerente', type: 'text' },
        { name: 'nome_gerente', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'receita_venda_produto', type: 'number' },
        { name: 'receita_venda_servico', type: 'number' },
        { name: 'custos_materiais', type: 'number' },
        { name: 'custos_servicos', type: 'number' },
        { name: 'custo_mao_de_obra', type: 'number' },
        { name: 'despesas_adm', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(projects)

    const settings = new Collection({
      name: 'settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'iss_rate', type: 'number' },
        { name: 'csll_rate', type: 'number' },
        { name: 'irpj_rate', type: 'number' },
        { name: 'margem_critica_pct', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(settings)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('projects'))
    app.delete(app.findCollectionByNameOrId('settings'))
  },
)
