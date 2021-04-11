const express = require('express');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const middleware = require('./utils/middelware')
const { findMonth } = require('./utils/function')

let { teams, scheduledTime } = require('./datamock.js')

const app = express()

// Middleware
app.use(express.static('build'))
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// TODO: use an external file maybe
app.get('/api/teams', (req, res) => {
  res.json(teams)
})

app.get('/api/teams/:id', (req,res) => {
  const id = req.params.id
  const team = teams.find(team => team.id === id)

  if (team) {
  res.json(team)

  } else {
    return res.status(404).end()
  }
})

app.delete('/api/teams/:id', (req, res) => {
  const id = req.params.id
  teams = teams.filter(team => team.id !== id)
  return res.status(204).end()
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
    // TODO schedule will be populated from the scheduleTime dataset
    schedule: body.schedule || {},
    dateOfCreation: new Date(),
  }

  teams = teams.concat(team)

  res.json(team)
})

// testing new data structure
app.get('/api/schedule', (req, res) => {
  res.json(scheduledTime)
})

app.get('/api/schedule/:year', (req,res) => {
  const year = req.params.year
  const scheduledTimeBlock = scheduledTime
    .find(s => +s.year === +year)

  if (scheduledTimeBlock) {
  res.json(scheduledTimeBlock)

  } else {
    return res.status(404).end()
  }
})

// strangly enough in a get the hypen - doesn't work in post it does
app.get('/api/schedule/:year/:month', (req, res) => {
  const year = req.params.year;
  const month = req.params.month;

  const scheduledTimeBlock = findMonth(scheduledTime, year,month)

  if (scheduledTimeBlock) {
  res.json(scheduledTimeBlock)

  } else {
    return res.status(201).json([])
  }
  return res.send(req.params)
})

app.delete('/api/schedule/:year/:month/:id', (req, res) => {
  const id = req.params.id
  const year = req.params.year
  const month = req.params.month

  let selectMonth = findMonth(scheduledTime, year,month)

  let updatedMonth = selectMonth.filter(sm => sm.userId !== id)

  scheduledTime
    .find(s => +s.year === +year).userSchedule[month] = updatedMonth

  return res.status(204).end()
})

app.post('/api/schedule/:year/:month', (req, res) => {
  const body = req.body;
  const year = req.params.year;
  const month = req.params.month

  if (!body.name) {
    return res.status(400).json({
      error: 'No Name provided'
    })
  }

  const userSchedule = {
    name: body.name,
    userId: uuidv4(), 
    days: body.days || [],
    dateOfCreation: new Date(),
  }

  let yearCheck = scheduledTime.findIndex(s => +s.year === +year)

  if (yearCheck < 0) {
    let newSchedule = {
      teamName: body.teamName,
      teamId: body.teamId,
      year: Number(year),
      userSchedule: Array(12).fill(null)
    }
    scheduledTime.push(newSchedule)
  }

  let selectMonth = findMonth(scheduledTime, year, month)

  if (selectMonth === null) selectMonth = []

  const updatedMonth = selectMonth.concat(userSchedule)

  scheduledTime
    .find(s => +s.year === +year).userSchedule[month] = updatedMonth

  res.json(userSchedule)
})

app.use(middleware.unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
