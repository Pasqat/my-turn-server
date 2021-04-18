const bcrypt = require("bcrypt")
const teamsRouter = require("express").Router()
const Team = require("../models/team")

teamsRouter.get("/", async (req, res) => {
    const teams = await Team.find({}).populate('schedules', {year: 1, userSchedule: 1})
    res.json(teams)
})

teamsRouter.post("/", async (req, res) => {
    const body = req.body

    const saltRound = 10
    const passwordHash = await bcrypt.hash(body.password, saltRound)

    const team = new Team({
        teamName: body.teamName,
        email: body.email,
        passwordHash,
    })

    const savedTeam = await team.save()

    res.json(savedTeam)
})

module.exports = teamsRouter
