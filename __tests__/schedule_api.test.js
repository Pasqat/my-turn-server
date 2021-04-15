const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
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
})

afterAll(() => {
    mongoose.connection.close()
})
