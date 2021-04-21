const Schedule = require("../models/schedule")
const Team = require("../models/team")
const { v4: uuidv4 } = require("uuid")

const nonExistingId = async () => {
    const schedule = new Schedule({
        name: "Tester",
        month: 1,
        userId: uuidv4()
    })
    await schedule.save()
    await schedule.remove()

    return schedule._id.toString()
}

const scheduleInDb = async () => {
    const schedule = await Schedule.find({})
    return schedule.map((schedule) => schedule.toJSON())
}

const scheduleInDbByYear = async (year) => {
    const schedule = await Schedule.find({
        year: year
    })
    return schedule.map((schedule) => schedule.toJSON())
}

const scheduleInDbByMonth = async (year, month) => {
    const schedule = await Schedule.findOne({
        year: year
    })

    return schedule.userSchedule.reduce(
        (a, b) => (b.month === month ? [...a, b] : a),
        []
    )
}

const getFirstUserSchedule = async (year) => {
    const schedule = await Schedule.find({
        year: year
    })
    return schedule[0].userSchedule.map((schedule) => schedule.toJSON())
}

const teamsInDb = async () => {
    const teams = await Team.find({})
    return teams.map((t) => t.toJSON())
}

const initialSchedule = [
    {
        team: "60800396eed7154dfc7bcd37",
        acceptedShift: [
            {
                tag: "morning",
                color: "#ff00ff"
            },
            {
                tag: "afternoon",
                color: "#ffff00"
            },
            {
                tag: "night",
                color: "#00ffff"
            }
        ],
        year: 2021,
        userSchedule: [
            {
                name: "Alessia",
                userId: "2fee0052-93ef-4512-a376-337634426df6",
                days: [
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    "morning",
                    null,
                    "morning",
                    "morning",
                    null,
                    null,
                    null,
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    "afternoon",
                    "night",
                    null,
                    "afternoon",
                    null,
                    null,
                    "morning"
                ],
                month: 4
            },
            {
                name: "Martina",
                userId: "e0df72b8-574a-43b2-b462-d4bccb8b2bba",
                days: [
                    null,
                    "afternoon",
                    "morning",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    null,
                    "afternoon",
                    null,
                    "night",
                    null,
                    "night",
                    null,
                    "afternoon",
                    "morning",
                    "night",
                    null,
                    "morning",
                    null,
                    "morning",
                    "night",
                    null,
                    "night",
                    null,
                    "aftrenoon",
                    null,
                    "morning"
                ],
                month: 4
            },
            {
                name: "Alessia",
                userId: "2fee0052-93ef-4512-a376-337634426df6",
                days: [
                    null,
                    "afternoon",
                    "morning",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    null,
                    "afternoon",
                    null,
                    "night",
                    null,
                    "night",
                    null,
                    "afternoon",
                    "morning",
                    "night",
                    null,
                    "morning",
                    null,
                    "morning",
                    "night",
                    null,
                    "night",
                    null,
                    "aftrenoon",
                    null,
                    "morning"
                ],
                month: 5
            },
            {
                name: "Martina",
                userId: "e0df72b8-574a-43b2-b462-d4bccb8b2bba",
                days: [
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    "morning",
                    null,
                    "morning",
                    "morning",
                    null,
                    null,
                    null,
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    "afternoon",
                    "night",
                    null,
                    "afternoon",
                    null,
                    null,
                    "morning"
                ],
                month: 5
            }
        ]
    },
    {
        team: "60800396eed7154dfc7bcd37",
        year: 2022,
        userSchedule: [
            {
                name: "Alessia",
                userId: "2fee0052-93ef-4512-a376-337634426df6",
                days: [
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    "morning",
                    null,
                    "morning",
                    "morning",
                    null,
                    null,
                    null,
                    "night",
                    null,
                    "morning",
                    "afternoon",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    "afternoon",
                    "night",
                    null,
                    "afternoon",
                    null,
                    null,
                    "morning"
                ],
                month: 0
            },
            {
                name: "Alessia",
                userId: "2fee0052-93ef-4512-a376-337634426df6",
                days: [
                    null,
                    "afternoon",
                    "morning",
                    null,
                    "night",
                    null,
                    null,
                    "morning",
                    null,
                    "afternoon",
                    null,
                    "night",
                    null,
                    "night",
                    null,
                    "afternoon",
                    "morning",
                    "night",
                    null,
                    "morning",
                    null,
                    "morning",
                    "night",
                    null,
                    "night",
                    null,
                    "aftrenoon",
                    null,
                    "morning"
                ],
                month: 0
            }
        ]
    }
]

module.exports = {
    initialSchedule,
    nonExistingId,
    scheduleInDb,
    scheduleInDbByYear,
    scheduleInDbByMonth,
    getFirstUserSchedule,
    teamsInDb
}
