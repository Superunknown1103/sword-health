const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// Parse incoming JSON requests
app.use(bodyParser.json())

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, world!')
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})