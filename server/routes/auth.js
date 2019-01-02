const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('../utils/jwt')

const throwError = (code, message) => {
  const err = new Error(message)
  err.statusCode = code
  throw err
}

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
          throwError(422, 'This email is already registered.')
        }
        return rUsers.insertUser(req.body)
      })
      .then(id => {
        return res.json({ id })
      })
      .catch(err => {
        console.error('Fatal Error: ', err.message)
        return res.status(err.statusCode || 500).send(err.message)
      })
  }

  const login = (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(422).send('Email and password required.')
    }

    rUsers.queryUserByEmail(email, ['id', 'username', 'email', 'password'])
      .then(user => {
        if (!user) {
          throwError(401, 'Invalid email or password.')
        }

        return bcrypt.compare(password, user.password)
          .then(isValid => {
            if (!isValid) {
              throwError(401, 'Invalid email or password.')
            }

            const token = jwt.serialize({ id: user.id, email: user.email })
            res.json({ token })
          })
          .catch(err => {
            throw err
          })
      })
      .catch(err => {
        console.error('Error logging in. ', err.message)
        res.status(err.statusCode || 500).send(err.message)
      })
  }

  const me = (req, res) => {
    const accessToken = req.headers['x-access-token']

    if (!accessToken) {
      return res.status(401).send('Unauthorized.')
    }

    jwt.deserialize(accessToken)
      .then(decoded => {
        const now = Date.now()
        if(decoded.exp >= now) {
          return res.status(401).send('Unauthorized.')
        }

        return rUsers.queryUserById(decoded.id)
      })
      .then(user => {
        if (!user) {
          throwError(400, 'User not found.')
        }
        res.json(user)
      })
      .catch(err => {
        console.error('Error: ', err.message)
        res.status(err.statusCode || 500).send(err.message || 'Unhandled Exception.')
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