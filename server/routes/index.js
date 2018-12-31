const router = require('express').Router()

module.exports = db => {
  const auth = require('./auth')(db)
  router.use('/auth', auth)

  return router
}