const schedulesRouter = require("express").Router()
const logger = require("../utils/logger")
const Schedule = require("../models/schedule")
const Team = require("../models/team")
const {
    v4: uuidv4
} = require("uuid")

schedulesRouter.get("/", async (req, res) => {
    const schedule = await Schedule.find({}).populate("team", {teamName: 1})
    if (schedule) {
        res.json(schedule)
    } else {
        res.status(404).end()
    }
})

schedulesRouter.get("/:year", async (req, res) => {
    const year = Number(req.params.year)

    const schedule = await Schedule.find({
        year: year
    })

    if (Array.isArray(schedule)) {
        res.json(schedule)
    } else {
        return res.status(404).end()
    }
})

schedulesRouter.get("/:year/:month", async (req, res) => {
    const year = req.params.year
    const month = Number(req.params.month)

    const schedule = await Schedule.findOne({
        year: year
    })

    const scheduledTimeBlock = schedule.userSchedule
        .reduce((a, b) => b.month === month ? [...a, b] : a, [])

    if (scheduledTimeBlock) {
        return res.json(scheduledTimeBlock)
    } else {
        res.status(201).json([])
    }
})

schedulesRouter.delete("/:year/:id", async (req, res) => {
    const id = req.params.id
    const year = req.params.year

    await Schedule.updateOne({
        year: year
    }, {
        $pull: {
            "userSchedule": {
                "_id": id
            }
        }
    })
    res.status(204).end()
})

schedulesRouter.post("/:year/:month", async (req, res) => {
    const body = req.body
    const year = Number(req.params.year)
    const month = Number(req.params.month)

    // FIXME this should be done by mongoose validation!!!
    if (!body.name) {
        return res.status(400).json({
            error: 'No Name provided'
        })
    }

    const team = await Team.findById(body.teamId)

    let userSchedule = {
        name: body.name,
        userId: uuidv4(),
        days: body.days || [],
        month: month
    }

    const yearCheck = await Schedule.findOne({
        year
    })

    if (!yearCheck) {
        const schedule = new Schedule({
            team: team._id,
            // TODO acceptedSchift are best in a own collection and populate
            acceptedSchift: [],
            year: year,
            userSchedule: [userSchedule]
        })

        const savedSchedule = await schedule.save()
        team.schedules = team.schedules.concat(savedSchedule._id)
        await team.save()

        res.json(savedSchedule)
    }

    const updatedSchedule = await Schedule
        .updateOne({
            year: year
        }, {
            $push: {
                "userSchedule": userSchedule
            }
        })

    res.json(updatedSchedule)

})

schedulesRouter.put("/:year/:id", async (req, res) => {
    const body = req.body
    const year = req.params.year
    const id = req.params.id

    let newSchedule = body

    const schedule = await Schedule
        .updateOne({
            year: year,
            "userSchedule._id": id
        }, {
            "userSchedule.$.days": newSchedule
        }, {
            new: true
        })
    res.send(200).json(schedule)
})

module.exports = schedulesRouter
