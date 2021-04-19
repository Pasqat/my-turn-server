const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const loginRouter = require("express").Router()
const Team = require("../models/team")

loginRouter.post("/", async (req, res) => {
    const body = req.body

    console.log('body', body)

    const team = await Team.findOne({teamName: body.teamName})
    const passwordCorrect = team === null
        ? false
        : await bcrypt.compare(body.password, team.passwordHash)

    if (!(team && passwordCorrect)) {
        return res.status(401).json({ error: "Invalid teamname or password"})
    }

    const teamForToken = {
        teamName: team.teamName,
        id: team._id,
    }

   const token = jwt.sign(teamForToken, process.env.SECRET)

    // TODO send the email too or not?
    res.status(200).send({ token, teamName: team.teamName })
})

module.exports = loginRouter
