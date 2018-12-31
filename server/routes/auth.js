const router = require('express').Router()

const clientUser = {
  username: 'jmltest',
  email: 'jml@test.com',
  password: 'asdfasdf'
}

module.exports = db => {
  const rUsers = require('../db/objects/users')(db)

  console.log('clientUser', JSON.stringify(clientUser, null, 2))

  const register = (req, res) => {
    const data = {
      type: 'registered',
      message: 'registered'
    }
    console.log(data)
    return res.json(data)
  }

  const login = (req, res) => {
    const data = {
      type: 'login',
      message: 'logged in.'
    }
    console.log(data)
    res.json(data)
  }

  const me = (req, res) => {
    const data = {
      type: 'info',
      message: 'me'
    }
    console.log(data)
    res.json(data)
  }

  router.post('/register', register)
  router.post('/login', login)
  router.get('/me', me)

  return router
}