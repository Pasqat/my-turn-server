const express = require('express');
const helmet = require('helmet');
const teams = require('./datamock.js')
const app = express()

// Middleware
app.use(helmet());


app.get('/', (req,res) => {
  res.send('Hello World')
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

app.delete('/api/team/:id', (req, res) => {
  const id = req.params.id
  teams = teams.filter(team => team.id !== id)

  res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
