const bcrypt = require("bcrypt")
const teamsRouter = require("express").Router()
const Team = require("../models/team")

// teamsRouter.get("/api/teams", (req, res) => {
//     res.json(teams)
// })

// teamsRouter.get("/api/teams/:id", (req, res) => {
//     const id = req.params.id
//     const team = teams.find(team => team.id === id)

//     if (team) {
//         res.json(team)

//     } else {
//         return res.status(404).end()
//     }
// })

// teamsRouter.delete("/api/teams/:id", (req, res) => {
//     const id = req.params.id
//     teams = teams.filter(team => team.id !== id)
//     return res.status(204).end()
// })

teamsRouter.get("/", async (req, res) => {
    const teams = await Team.find({})
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
