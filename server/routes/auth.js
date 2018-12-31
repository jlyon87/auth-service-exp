const router = require('express').Router()
const jwt = require('../utils/jwt')

module.exports = db => {
  const rUsers = require('../db/objects/users')(db)

  const register = (req, res) => {
    const data = {
      type: 'registered',
      message: 'registered'
    }

    const { username, email, password } = req.body
    if(!username || !email || !password) {
      return res.status(400).send('Username, email, and password required.')
    }

    rUsers.queryUserByEmail(email, ['email'])
      .then(user => {
        if(user) {
          return res.status(400).send('This email is already registered.')
        }
        return rUsers.insertUser(req.body)
      })
      .then(id => {
        const token = jwt.serialize({ id, email })
        return res.json({ token })
      })
      .catch(err => {
        console.error('Fatal Error: ', err.message)
        // return res.status(500).json({
        //   message: 'Fatal server error',
        //   err
        // })
      })

    // Is Valid?
    // Does user already exist?
    // create User
    // create token
    // respond with token
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
    const token = req.headers['x-access-token']
    if(token) {
      const user = jwt.deserialize(token)
      if(user.exp <= Date.now()) {
        return res.status(401).send('Unauthorized.')
      }

      return res.json(user)
    }
    return res.status(401).send('Unauthorized.')
    // has header x-access-token ?
    // deserialize token
    // respond with user
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