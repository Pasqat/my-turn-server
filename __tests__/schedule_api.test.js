const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)
const {
    v4: uuidv4
} = require("uuid")
const Schedule = require("../models/schedule")
const helper = require("./test_helper")

beforeEach(async () => {
    await Schedule.deleteMany({})

    let scheduleObject = new Schedule(helper.initialSchedule[0])
    await scheduleObject.save()

    scheduleObject = new Schedule(helper.initialSchedule[1])
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
        expect(response.body).toHaveLength(helper.initialSchedule.length)
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

        const schedulesAtEnd = await helper.getFirstUserSchedule(2021)
        expect(schedulesAtEnd).toHaveLength(helper.initialSchedule[0].userSchedule.length + 1 )

        const namesInSchedule = schedulesAtEnd.map(schedule => schedule.name)
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
            .expect(400)

        const schedulesAtEnd = await helper.getFirstUserSchedule(2021)

        expect(schedulesAtEnd).toHaveLength(helper.initialSchedule[0].userSchedule.length)
    })

    test("a schedule can be deleted", async () => {
        const year = 2021
        const scheduleAtStart = await helper.scheduleInDbByYear(year) 
        const scheduleToDelete = scheduleAtStart[0].userSchedule[0]

        await api
            .delete(`/api/schedule/${year}/${scheduleToDelete._id}`)
            .expect(204)

        const schedulesAtEnd = await helper.scheduleInDbByYear(year)
        const userSchedulAtEnd = schedulesAtEnd[0].userSchedule

        expect(userSchedulAtEnd).toHaveLength(
            helper.initialSchedule[0].userSchedule.length - 1
        )
    })
})

afterAll(() => {
    mongoose.connection.close()
})
