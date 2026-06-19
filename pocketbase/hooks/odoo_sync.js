routerAdd(
  'POST',
  '/backend/v1/sync-odoo',
  (e) => {
    const url = $secrets.get('ODOO_URL') || ''
    const user = $secrets.get('ODOO_USER') || ''
    const pass = $secrets.get('ODOO_PASSWORD') || ''

    if (!url || !user || !pass) {
      $app.logger().error('Odoo credentials missing in secrets')
      return e.badRequestError('Credenciais do Odoo não configuradas nos Segredos (Secrets).')
    }

    let odooProjects = []

    try {
      const res = $http.send({
        url: url.replace(/\/$/, '') + '/api/projects',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Odoo-User': user,
          'X-Odoo-Password': pass,
        },
        timeout: 15,
      })

      if (res.statusCode >= 400) {
        throw new Error('Odoo API retornou status ' + res.statusCode)
      }

      odooProjects = res.json?.data || res.json || []
    } catch (err) {
      $app.logger().error('Failed to fetch from Odoo', 'error', err.message, 'url', url)
      return e.badRequestError('A API do Odoo está inacessível ou as credenciais são inválidas.')
    }

    if (!Array.isArray(odooProjects)) {
      return e.badRequestError('Formato de resposta do Odoo inválido.')
    }

    let updatedCount = 0
    let createdCount = 0

    const projectsCollection = $app.findCollectionByNameOrId('projects')

    $app.runInTransaction((txApp) => {
      for (const pData of odooProjects) {
        let record
        try {
          record = txApp.findFirstRecordByData('projects', 'nome_projeto', pData.nome_projeto)
          updatedCount++
        } catch (_) {
          record = new Record(projectsCollection)
          record.set('nome_projeto', pData.nome_projeto)
          createdCount++
        }

        if (pData.id_gerente) record.set('id_gerente', pData.id_gerente)
        if (pData.nome_gerente) record.set('nome_gerente', pData.nome_gerente)
        if (pData.status) record.set('status', pData.status)
        if (pData.receita_venda_produto !== undefined)
          record.set('receita_venda_produto', Number(pData.receita_venda_produto))
        if (pData.receita_venda_servico !== undefined)
          record.set('receita_venda_servico', Number(pData.receita_venda_servico))
        if (pData.custos_materiais !== undefined)
          record.set('custos_materiais', Number(pData.custos_materiais))
        if (pData.custos_servicos !== undefined)
          record.set('custos_servicos', Number(pData.custos_servicos))
        if (pData.custo_mao_de_obra !== undefined)
          record.set('custo_mao_de_obra', Number(pData.custo_mao_de_obra))
        if (pData.despesas_adm !== undefined) record.set('despesas_adm', Number(pData.despesas_adm))

        txApp.save(record)
      }
    })

    return e.json(200, {
      success: true,
      message: `Sincronização concluída. ${createdCount} criados, ${updatedCount} atualizados.`,
      created: createdCount,
      updated: updatedCount,
    })
  },
  $apis.requireAuth(),
)
