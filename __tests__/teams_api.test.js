const bcrypt = require('bcrypt')
const Team = require('../models/team')
const helper = require("./test_helper")

const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await Team.deleteMany()

        const passwordHash = await bcrypt.hash('secret', 10)
        const team = new Team({
            teamName: 'root',
            passwordHash
        })

        await team.save()
    })

    test('creation succeeds with a fresh teamName', async () => {
        const teamsAtStart = await helper.teamsInDb()
        console.log('start', teamsAtStart)

        const newTeam = {
            teamName: "Team Rocket",
            email: "teamrocket@trmail.com",
            password: "persian"
        }

        await api
            .post("/api/team")
            .send(newTeam)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const teamsAtEnd = await helper.teamsInDb()
        expect(teamsAtEnd).toHaveLength(teamsAtStart.length + 1)
        console.log('end', teamsAtEnd)

        const teamNames = teamsAtEnd.map(t => t.teamName)
        expect(teamNames).toContain(newTeam.teamName)
    })

    test('creation fails with proper statuscode and message if teamName already exist',
        async () => {
            const teamsAtStart = await helper.teamsInDb()

            const newTeam = {
                teamName: "root",
                email: "root@root.com",
                password: "persian"
            }

            const result = await api
                .post("/api/team")
                .send(newTeam)
                .expect(400)
                .expect("Content-Type", /application\/json/)

            expect(result.body.error).toContain('`teamName` to be unique')

            const teamsAtEnd = await helper.teamsInDb()
            expect(teamsAtEnd).toHaveLength(teamsAtStart.length)
        })
})
