const router = require('express').Router()

const errorHandler = (err, req, res, next) => {
  if (err) {
    console.log('errorHandler', {
      statusCode: err.statusCode,
      message: err.message
    })
    return res.status(err.statusCode || 500).json(err || { message: 'Unhandled Exception.' })
  }
  next()
}

module.exports = db => {
  const auth = require('./auth')(db)
  router.use('/auth', auth)

  router.use('/', errorHandler)
  return router
}