const router = require('express').Router()
const jwt = require('../utils/jwt')

module.exports = db => {
  const rUsers = require('../db/objects/users')(db)

  const register = (req, res) => {
    const { username, email, password } = req.body
    if(!username || !email || !password) {
      return res.status(422).send('Username, email, and password required.')
    }

    rUsers.queryUserByEmail(email, ['email'])
      .then(user => {
        if(user) {
          const err = new Error('This email is already registered.')
          err.statusCode = 422
          throw err
        }
        return rUsers.insertUser(req.body)
      })
      .then(id => {
        const token = jwt.serialize({ id, email })
        return res.json({ token })
      })
      .catch(err => {
        console.error('Fatal Error: ', err.message)
        return res.status(err.statusCode || 500).send(err.message)
      })
  }

  const login = (req, res) => {
    const data = {
      type: 'login',
      message: 'logged in.'
    }
    res.json(data)

    // is Valid?
    // Does user Exist?
    // create token
    // respond with token
  }

  const me = (req, res) => {
    const accessToken = req.headers['x-access-token']

    if (!accessToken) {
      return res.status(401).send('Unauthorized.')
    }

    const token = jwt.deserialize(accessToken)
    const now = Date.now()
    if(token.exp >= now) {
      return res.status(401).send('Unauthorized.')
    }

    rUsers.queryUserById(token.id)
      .then(user => {
        res.json(user)
      })
      .catch(err => {
        console.error('Error: ', err.message)
        res.status(404).send('User not found')
      })
  }

  router.use('/', (req, res, next) => {
    console.log('req.body', req.body)
    console.log('token', req.headers['x-access-token'])
    next()
  })

  router.post('/register', register)
  router.post('/login', login)
  router.get('/me', me)

  return router
}