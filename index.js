const express = require('express');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const middleware = require('./utils/middelware')

let teams = require('./datamock.js')

const app = express()

// Middleware
app.use(express.static('build'))
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// TODO: use an external file maybe
app.get('/', (req,res) => {
  // res.send('./build/index.js')
})

app.get('/api/teams', (req, res) => {
  res.json(teams)
})

app.get('/api/teams/:id', (req,res) => {
  const id = req.params.id
  const team = teams.find(team => team.id === id)

  if (team) {
  res.json(team)

  } else {
    res.status(404).end()
  }
})

app.delete('/api/teams/:id', (req, res) => {
  const id = req.params.id
  teams = teams.filter(team => team.id !== id)
  res.status(204).end()
})

app.post('/api/teams', (req, res) => {
  const body = req.body;

  if (!body.name) {
    return res.status(400).json({
      error: 'No Team Name provided'
    })
  }

  const team = {
    name: body.name,
    id: uuidv4(),
    schedule: body.schedule || {},
    dateOfCreation: new Date(),
  }

  teams = teams.concat(team)

  res.json(team)
})

app.use(middleware.unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
