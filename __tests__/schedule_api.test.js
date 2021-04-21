const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
const { v4: uuidv4 } = require("uuid")

const Schedule = require("../models/schedule")
const Team = require("../models/team")
const helper = require("./test_helper")

beforeEach(async () => {
    await Schedule.deleteMany({})
    await Team.deleteMany({})

    for (let schedule of helper.initialSchedule) {
        let scheduleObject = new Schedule(schedule)
        await scheduleObject.save()
    }
})

describe("testing content and operation of schedule", () => {
    describe("when there is initailly some schedules saved", () => {
        test("schedules are returned as json", async () => {
            await api
                .get("/api/schedule")
                .expect(200)
                .expect("Content-Type", /application\/json/)
        })

        test("all schedules are returned", async () => {
            const response = await api.get("/api/schedule")
            expect(response.body).toHaveLength(helper.initialSchedule.length)
        })

        test("a specific schedule is within the returned schedule", async () => {
            const response = await api.get("/api/schedule")
            const year = response.body.map((r) => r.year)
            expect(year).toContain(2021)
        })
    })

    describe("viewing a specific schedule", () => {
        test("the year of the first schedule is 2021", async () => {
            const response = await api.get("/api/schedule")
            expect(response.body[0].year).toBe(2021)
        })

        test("a single year is returned with 4 schedule", async () => {
            const response = await api.get("/api/schedule/2021")
            expect(response.body[0].userSchedule).toHaveLength(4)
        })

        test("a specific month is picked from a year", async () => {
            const response = await api.get("/api/schedule/2021/4")
            expect(response.body).toHaveLength(2)
        })
    })

    describe("addition of new scheduled member", () => {
        let headers

        beforeEach(async () => {
            const newTeam = {
                teamName: "Tester",
                email: "test@test.com",
                password: "password"
            }

            await api.post("/api/team").send(newTeam)

            const result = await api.post("/api/login").send(newTeam)

            headers = {
                Authorization: `bearer ${result.body.token}`
            }
        })

        test("a valid schedule can be added in a specific year", async () => {
            const newSchedule = {
                name: "Tester",
                userId: uuidv4(),
                days: [null, null, "morning"],
                month: 1
            }

            await api
                .post("/api/schedule/2021/1")
                .send(newSchedule)
                .set(headers)
                .expect(200)
                .expect("Content-Type", /application\/json/)

            const schedulesAtEnd = await helper.getFirstUserSchedule(2021)
            expect(schedulesAtEnd).toHaveLength(
                helper.initialSchedule[0].userSchedule.length + 1
            )

            const namesInSchedule = schedulesAtEnd.map(
                (schedule) => schedule.name
            )
            expect(namesInSchedule).toContain("Tester")
        })

        test("schedule without content is not added", async () => {
            const newSchedule = {
                days: [],
                month: 1
            }

            await api
                .post("/api/schedule/2021/1")
                .send(newSchedule)
                .set(headers)
                .expect(400)

            const schedulesAtEnd = await helper.getFirstUserSchedule(2021)

            expect(schedulesAtEnd).toHaveLength(
                helper.initialSchedule[0].userSchedule.length
            )
        })

        // FIXME result without correct authorization
        test("a schedule can be deleted", async () => {
            const year = 2021
            const scheduleAtStart = await helper.scheduleInDbByYear(year)
            const scheduleToDelete = scheduleAtStart[0].userSchedule[0]

            await api
                .delete(`/api/schedule/${year}/${scheduleToDelete._id}`)
                .set(headers)
                .expect(204)

            const schedulesAtEnd = await helper.scheduleInDbByYear(year)
            console.log("end", schedulesAtEnd)
            const userSchedulAtEnd = schedulesAtEnd[0].userSchedule

            expect(userSchedulAtEnd).toHaveLength(
                helper.initialSchedule[0].userSchedule.length - 1
            )
        })
    })
})

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        const passwordHash = await bcrypt.hash("secret", 10)
        const team = new Team({
            teamName: "root",
            passwordHash
        })
        await team.save()
    })

    test("creation succeeds with a fresh teamName", async () => {
        const teamsAtStart = await helper.teamsInDb()

        const newTeam = {
            teamName: "Team Rocket",
            email: "teamrocket@trmail.com",
            password: "persian"
        }

        await api
            .post("/api/team")
            .send(newTeam)
            .expect(200)
            .expect("Content-Type", /application\/json/)

        const teamsAtEnd = await helper.teamsInDb()
        expect(teamsAtEnd).toHaveLength(teamsAtStart.length + 1)

        const teamNames = teamsAtEnd.map((t) => t.teamName)
        expect(teamNames).toContain(newTeam.teamName)
    })

    test("creation fails with proper statuscode and message if teamName already exist", async () => {
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

        expect(result.body.error).toContain("`teamName` to be unique")

        const teamsAtEnd = await helper.teamsInDb()
        expect(teamsAtEnd).toHaveLength(teamsAtStart.length)
    })

    // TODO test for email uniqueness
    // test("creation fails for email already taken", async => {
    // }
})

afterAll(() => {
    mongoose.connection.close()
})
