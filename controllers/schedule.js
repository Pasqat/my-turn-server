const schedulesRouter = require("express").Router()
const Schedule = require("../models/schedule")
const {
    v4: uuidv4
} = require("uuid")

schedulesRouter.get("/", (req, res) => {

    Schedule.find({}).then(schedule => {
        if (schedule) {
            console.log(schedule.userSchedule)
            res.json(schedule)
        } else {
            res.status(404).end()
        }
    }).catch(err => {
        console.log(err)
        res.status(500).end()
    })

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
        console.log(err)
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

schedulesRouter.post("/:year/:month", (req, res) => {
    const body = req.body
    const year = Number(req.params.year)
    const month = Number(req.params.month)

    // if (!body.name) {
    //     return res.status(400).json({
    //         error: 'No Name provided'
    //     })
    // }

    let userSchedule = {
        name: body.name,
        userId: uuidv4(),
        days: body.days || [],
        month: month
    }

    Schedule.findOne({
        year: year
    })
        .then(yearCheck => {
            if (!yearCheck) {
                const schedule = new Schedule({
                    teamName: body.teamName,
                    teamId: body.teamId,
                    // TODO acceptedSchift are best in a own collection and populate
                    acceptedSchift: [],
                    year: year,
                    userSchedule: [userSchedule]
                })

                schedule.save().then(() => res.json(userSchedule))

            } else {
                Schedule.updateOne({
                    year: year
                }, {
                    $push: {
                        "userSchedule": userSchedule
                    }
                }).then(() => res.json(userSchedule))
            }
        })

})

schedulesRouter.put("/:year/:id", (req, res) => {
    const body = req.body
    const year = req.params.year
    const id = req.params.id

    console.log("body", body)

    let newSchedule = body

    console.log(newSchedule)

    Schedule
        .updateOne({
            year: year,
            "userSchedule._id": id
        }, {
            "userSchedule.$.days": newSchedule
        }, {
            new: true
        }).then(result => {
            console.log("update", result)
            res.status(200).json(result)
        }).catch(error => console.error(error))
})

module.exports = schedulesRouter
