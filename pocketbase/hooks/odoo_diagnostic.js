// @deps
routerAdd(
  'POST',
  '/backend/v1/diagnostic',
  (e) => {
    const body = e.requestInfo().body || {}
    const code = body.code
    if (!code) return e.badRequestError('missing code')

    const ODOO_URL = $secrets.get('ODOO_URL')
    const ODOO_DB = $secrets.get('ODOO_DB') || 'odoo'
    const ODOO_USER = $secrets.get('ODOO_USER')
    const ODOO_PASSWORD = $secrets.get('ODOO_PASSWORD')

    if (!ODOO_URL || !ODOO_USER || !ODOO_PASSWORD) {
      return e.badRequestError('Odoo credentials missing in secrets')
    }

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

    if (authRes.statusCode !== 200) return e.internalServerError('Odoo auth failed')
    const uid = authRes.json?.result
    if (!uid) return e.internalServerError('Odoo auth failed: invalid credentials')

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
            [[['code', '=', code]]],
            { fields: ['id', 'name', 'code'], limit: 1 },
          ],
        },
      }),
    })

    const accounts = searchRes.json?.result
    if (!accounts || accounts.length === 0) {
      return e.notFoundError('Project not found')
    }

    const account = accounts[0]
    const accountId = account.id

    const movesRes = $http.send({
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
            'account.move.line',
            'search_read',
            [[['analytic_account_id', '=', accountId]]],
            {
              fields: ['id', 'name', 'account_id', 'credit', 'debit', 'balance', 'date'],
              limit: 100,
            },
          ],
        },
      }),
    })

    const analyticRes = $http.send({
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
            'account.analytic.line',
            'search_read',
            [[['account_id', '=', accountId]]],
            { fields: ['id', 'name', 'amount', 'unit_amount', 'date', 'employee_id'], limit: 100 },
          ],
        },
      }),
    })

    return e.json(200, {
      account,
      moveLines: movesRes.json?.result || [],
      analyticLines: analyticRes.json?.result || [],
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/odoo/projects',
  (e) => {
    const ODOO_URL = $secrets.get('ODOO_URL')
    const ODOO_DB = $secrets.get('ODOO_DB') || 'odoo'
    const ODOO_USER = $secrets.get('ODOO_USER')
    const ODOO_PASSWORD = $secrets.get('ODOO_PASSWORD')

    if (!ODOO_URL || !ODOO_USER || !ODOO_PASSWORD) {
      return e.badRequestError('Odoo credentials missing in secrets')
    }

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
    if (!uid) return e.internalServerError('Odoo auth failed')

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
            { fields: ['id', 'name', 'code', 'partner_id', 'user_id'] },
          ],
        },
      }),
    })

    return e.json(200, { projects: searchRes.json?.result || [] })
  },
  $apis.requireAuth(),
)
