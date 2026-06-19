routerAdd(
  'POST',
  '/backend/v1/sync-odoo',
  (e) => {
    const ODOO_URL = $secrets.get('ODOO_URL')
    const ODOO_DB = $secrets.get('ODOO_DB') || 'odoo'
    const ODOO_USER = $secrets.get('ODOO_USER')
    const ODOO_PASSWORD = $secrets.get('ODOO_PASSWORD')

    if (!ODOO_URL || !ODOO_USER || !ODOO_PASSWORD) {
      $app.logger().error('Odoo credentials missing in secrets')
      return e.badRequestError('Credenciais do Odoo não configuradas nos Segredos (Secrets).')
    }

    let odooProjects = []

    try {
      const authRes = $http.send({
        url: ODOO_URL + '/jsonrpc',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'common',
            method: 'authenticate',
            args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}],
          },
        }),
      })

      const uid = authRes.json?.result
      if (!uid) return e.badRequestError('Falha na autenticação do Odoo.')

      const searchRes = $http.send({
        url: ODOO_URL + '/jsonrpc',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute_kw',
            args: [
              ODOO_DB,
              uid,
              ODOO_PASSWORD,
              'account.analytic.account',
              'search_read',
              [],
              { fields: ['id', 'name', 'code', 'user_id', 'partner_id'] },
            ],
          },
        }),
      })

      odooProjects = searchRes.json?.result || []
    } catch (err) {
      $app.logger().error('Failed to fetch from Odoo', 'error', err.message, 'url', ODOO_URL)
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
        if (!pData.name) continue

        let record
        try {
          record = txApp.findFirstRecordByData('projects', 'nome_projeto', pData.name)
          updatedCount++
        } catch (_) {
          record = new Record(projectsCollection)
          record.set('nome_projeto', pData.name)
          createdCount++
        }

        if (pData.user_id && Array.isArray(pData.user_id)) {
          record.set('id_gerente', String(pData.user_id[0]))
          record.set('nome_gerente', pData.user_id[1])
        }

        if (!record.get('status')) {
          record.set('status', 'Em Andamento')
        }

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
