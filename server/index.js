const express = require('express')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3001
const app = express()

app.use(bodyParser.json())

const db = require('./db')
const router = require('./routes')(db)
app.use(router)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})