const teamsRouter = require("express").Router()
// TODO const Team = require("../models/team")
const {
    v4: uuidv4
} = require("uuid")


// TODO: use an external file maybe
app.get('/api/teams', (req, res) => {
    res.json(teams)
})

app.get('/api/teams/:id', (req, res) => {
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

module.export = teamsRouter
