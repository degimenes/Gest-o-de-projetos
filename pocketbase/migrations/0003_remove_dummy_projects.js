migrate(
  (app) => {
    app
      .db()
      .newQuery(`
    DELETE FROM projects 
    WHERE nome_projeto IN (
      'Auditoria de Segurança', 
      'Integração de APIs', 
      'Manutenção de Sistemas', 
      'Implementação ERP Odoo'
    )
  `)
      .execute()
  },
  (app) => {},
)
