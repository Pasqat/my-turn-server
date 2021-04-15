const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
const {
    v4: uuidv4
} = require("uuid")
const Schedule = require("../models/schedule")

const initialSchedule = require("../datamock").scheduledTime

beforeEach(async () => {
    await Schedule.deleteMany({})
    let scheduleObject = new Schedule(initialSchedule[0])
    await scheduleObject.save()
    scheduleObject = new Schedule(initialSchedule[1])
    await scheduleObject.save()
})

describe("testing content and format of schedule", () => {
    test('schedules are returned as json', async () => {
        await api
            .get('/api/schedule')
            .expect(200)
            .expect("Content-Type", /application\/json/)
    })

    test("all schedules are returned", async () => {
        const response = await api.get("/api/schedule")
        expect(response.body).toHaveLength(initialSchedule.length)
    })

    test("a specific schedule is within the returned schedule", async () => {
        const response = await api.get("/api/schedule")
        const year = response.body.map(r => r.year)
        expect(year).toContain(2021)
    })

    test('the year of the first schedule is 2021', async () => {
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
            .expect(200)
            .expect("Content-Type", /application\/json/)

        const response = await api.get('/api/schedule/2021')
        const userScheduleNames = [...response.body[0].userSchedule].map(r => r.name)

        console.log(userScheduleNames)

        expect(response.body[0].userSchedule).toHaveLength(initialSchedule[0].userSchedule.length + 1 )
        expect(userScheduleNames).toContain("Tester")
    })

    test("schedule without content is not added", async () => {
        const newSchedule = {
            days: [],
            month: 1
        }

        await api
            .post("/api/schedule/2021/1")
            .send(newSchedule)
            .expect(400)

        const response = await api.get("/api/schedule/2021")

        expert(response.body[0].userSchedule).toHaveLength(initialSchedule[0].userSchedule.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
