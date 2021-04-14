require("dotenv").config();
const express = require('express');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const middleware = require('./utils/middelware')

const Schedule = require('./models/schedule')

let { teams } = require('./datamock.js')

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
    // TODO schedule will be populated from the scheduleTime dataset
    schedule: body.schedule || {},
    dateOfCreation: new Date(),
  }

  teams = teams.concat(team)

  res.json(team)
})



app.get('/api/schedule', (req, res) => {

    Schedule.find({}).then(schedule => {
        if (schedule) {
            console.log(schedule.userSchedule)
            res.json(schedule)
        } else {
            res.status(404).end()
        }
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

})

app.get('/api/schedule/:year', (req,res) => {
    const year = Number(req.params.year)

    Schedule.find({year: year}).then(schedule => {
        if (Array.isArray(schedule)) {
            res.json(schedule)
        } else {
            return res.status(404).end()
        }
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

})

app.get('/api/schedule/:year/:month', (req, res) => {
    const year = req.params.year;
    const month = Number(req.params.month);

    Schedule.findOne({year: year}).then(schedule => {
        const scheduledTimeBlock = schedule.userSchedule
            .reduce((a, b) => b.month === month ? [...a, b] : a, [])

        if (scheduledTimeBlock) {
            return res.json(scheduledTimeBlock)
        } else {
            res.status(201).json([])
        }

    }).catch(err => next(err))
})

app.delete('/api/schedule/:year/:id', (req, res, next) => {
    const id = req.params.id
    const year = req.params.year

    Schedule.updateOne(
        { year: year},
        {
            $pull: {
                "userSchedule": {
                    "_id": id
                }
            }
        }
    ).then(() => {
        return res.status(204).end()
    }).catch(error => next(error))
})

app.post('/api/schedule/:year/:month', (req, res) => {
    const body = req.body;
    const year = Number(req.params.year);
    const month = Number(req.params.month)

    if (!body.name) {
        return res.status(400).json({
            error: 'No Name provided'
        })
    }

    let userSchedule = {
        name: body.name,
        userId: uuidv4(),
        days: body.days || [],
        month: month
    }

    Schedule.findOne({year: year})
        .then(yearCheck => {
            if (!yearCheck) {
                const schedule = new Schedule({
                    teamName: body.teamName,
                    teamId: body.teamId,
                    // TODO acceptedSchift are best in a own collection and populate
                    acceptedSchift: [
                    ],
                    year: year,
                    userSchedule: [userSchedule]
                })

                schedule.save().then(() => res.json(userSchedule))

            } else {
                Schedule.updateOne(
                    {year: year},
                    {$push: {'userSchedule': userSchedule}}   
                ).then(() => res.json(userSchedule))
            }
        })

})

app.put('/api/schedule/:year/:id', (req, res) => {
    const body = req.body;
    const year = req.params.year
    const id = req.params.id

    console.log('body',body)

    let newSchedule = body

    console.log(newSchedule)

    Schedule
        .updateOne(
            {year: year, "userSchedule._id": id},
            {"userSchedule.$.days" : newSchedule},
            { new: true } 
        ).then(result => {
            console.log('update', result)
            res.status(200).json(result)
        }).catch(error => console.error(error))

    // Schedule
    //     .updateOne(
    //         {year: year, "userSchedule": {"_id": id}},
    //         { $pull: { "userSchedule": { "_id": id } } }
    //     ).then(result => {
    //         console.log('update', result)
    //         res.status(200).json(result)
    //     }).catch(error => console.error(error))
})

app.use(middleware.unknownEndpoint)

app.use(middleware.errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
