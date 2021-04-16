const schedulesRouter = require("express").Router()
const logger = require("../utils/logger")
const Schedule = require("../models/schedule")
const {
    v4: uuidv4
} = require("uuid")

schedulesRouter.get("/", async (req, res) => {
    try{
        const schedule = await Schedule.find({})
        if (schedule) {
            res.json(schedule)
        } else {
            res.status(404).end()
        }
    } catch(exception) {
        logger.error(exception)
        res.status(500).end()
    }
})

schedulesRouter.get("/:year", (req, res) => {
    const year = Number(req.params.year)

    Schedule.find({
        year: year
    }).then(schedule => {
        if (Array.isArray(schedule)) {
            res.json(schedule)
        } else {
            return res.status(404).end()
        }
    }).catch(err => {
        logger.error(err)
        res.status(500).end()
    })

})

schedulesRouter.get("/:year/:month", (req, res) => {
    const year = req.params.year
    const month = Number(req.params.month)

    Schedule.findOne({
        year: year
    }).then(schedule => {
        const scheduledTimeBlock = schedule.userSchedule
            .reduce((a, b) => b.month === month ? [...a, b] : a, [])

        if (scheduledTimeBlock) {
            return res.json(scheduledTimeBlock)
        } else {
            res.status(201).json([])
        }

    }).catch(err => next(err))
})

schedulesRouter.delete("/:year/:id", (req, res, next) => {
    const id = req.params.id
    const year = req.params.year

    Schedule.updateOne({
        year: year
    }, {
        $pull: {
            "userSchedule": {
                "_id": id
            }
        }
    }).then(() => {
        return res.status(204).end()
    }).catch(error => next(error))
})

schedulesRouter.post("/:year/:month", async (req, res, next) => {
    const body = req.body
    const year = Number(req.params.year)
    const month = Number(req.params.month)

    // FIXME this should be done by mongoose validation!!!
    if (!body.name) {
        return res.status(400).json({
            error: 'No Name provided'
        })
    }

    let userSchedule = {
        name: body.name,
        userId: uuidv4(),
        days: body.days || [],
        month: month
    }

    try {
        const yearCheck = await Schedule.findOne({year})

        if (!yearCheck) {
            const schedule = new Schedule({
                teamName: body.teamName,
                teamId: body.teamId,
                // TODO acceptedSchift are best in a own collection and populate
                acceptedSchift: [],
                year: year,
                userSchedule: [userSchedule]
            })

            const savedSchedule = await schedule.save()
            res.json(savedSchedule)
        }

        const updatedSchedule = await Schedule
            .updateOne({year: year}, {$push : {"userSchedule": userSchedule}})

        res.json(updatedSchedule)

    } catch (exception) {

        next(exception)

    }
})

schedulesRouter.put("/:year/:id", (req, res) => {
    const body = req.body
    const year = req.params.year
    const id = req.params.id

    let newSchedule = body

    Schedule
        .updateOne({
            year: year,
            "userSchedule._id": id
        }, {
            "userSchedule.$.days": newSchedule
        }, {
            new: true
        }).then(result => {
            res.status(200).json(result)
        }).catch(error => logger.error(error))
})

module.exports = schedulesRouter
