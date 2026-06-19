migrate(
  (app) => {
    app.db().newQuery('DELETE FROM projects').execute()
  },
  (app) => {},
)
