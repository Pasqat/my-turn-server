const schedulesRouter = require("express").Router();
// const logger = require("../utils/logger")
const { teamExtractor } = require("../utils/middelware");
const jwt = require("jsonwebtoken");
const Schedule = require("../models/schedule");
// const Team = require("../models/team")
const { v4: uuidv4 } = require("uuid");

schedulesRouter.get("/", async (req, res) => {
    const schedule = await Schedule.find({}).populate("team", {
        teamName: 1
    });
    if (schedule) {
        res.json(schedule);
    } else {
        res.sendStatus(404).end();
    }
});

schedulesRouter.get("/:year", async (req, res) => {
    const year = Number(req.params.year);

    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!req.token || !decodedToken.id) {
        return res.sendStatus(401).json({ error: "token missing or invalid" });
    }

    const schedule = await Schedule.find({
        year: year,
        team: decodedToken.id
    });

    if (Array.isArray(schedule)) {
        res.json(schedule);
    } else {
        return res.sendStatus(404).end();
    }
});

schedulesRouter.get("/:year/:month", async (req, res) => {
    const year = req.params.year;
    const month = Number(req.params.month);

    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!req.token || !decodedToken.id) {
        return res.status(401).json({ error: "token missing or invalid" });
    }

    const schedule = await Schedule.findOne({
        year: year,
        team: decodedToken.id
    });

    if (schedule) {
        const scheduledTimeBlock = schedule.userSchedule.reduce(
            (a, b) => (b.month === month ? [...a, b] : a),
            []
        );
        return res.json(scheduledTimeBlock);
    } else {
        res.status(201).json([]);
    }
});

schedulesRouter.delete("/:year/:id", teamExtractor, async (req, res) => {
    const id = req.params.id;
    const year = req.params.year;

    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!req.token || !decodedToken.id) {
        return res.sendStatus(401).json({ error: "token missing or invalid" });
    }

    const team = req.team;
    const schedule = await Schedule.findOne({
        year: year,
        team: decodedToken.id
    });

    if (schedule.team.toString() !== team._id.toString()) {
        return res
            .sendStatus(401)
            .json({ error: "only the creator can delete or modify" });
    }

    await Schedule.updateOne(
        {
            year: year,
            team: decodedToken.id
        },
        {
            $pull: {
                userSchedule: {
                    _id: id
                }
            }
        }
    );
    res.sendStatus(204).end();
});

schedulesRouter.post("/:year/:month", teamExtractor, async (req, res) => {
    const body = req.body;
    const year = Number(req.params.year);
    const month = Number(req.params.month);
    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!decodedToken.id) {
        return res.sendStatus(401).json({ error: "Token missing or invalid" });
    }

    const team = req.team;

    // FIXME this should be done by mongoose validation!!!
    if (!body.name) {
        return res.sendStatus(400).json({
            error: "No Name provided"
        });
    }

    let userSchedule = {
        name: body.name,
        userId: uuidv4(),
        days: body.days || [],
        month: month
    };

    const yearCheck = await Schedule.findOne({
        year,
        team: decodedToken.id
    });

    if (!yearCheck) {
        const schedule = new Schedule({
            team: team._id,
            acceptedSchift: [],
            year: year,
            userSchedule: [userSchedule]
        });

        const savedSchedule = await schedule.save();
        team.schedules = team.schedules.concat(savedSchedule._id);
        await team.save();

        return res.json(savedSchedule.userSchedule[0]);
    }

    const updatedSchedule = await Schedule.findOneAndUpdate(
        {
            year: year,
            team: decodedToken.id
        },
        {
            $push: {
                userSchedule: userSchedule
            }
        },
        { new: true }
    );

    const updatedUserSchedule =
        updatedSchedule.userSchedule[updatedSchedule.userSchedule.length - 1];

    res.json(updatedUserSchedule);
});

schedulesRouter.put("/:year/:id", async (req, res) => {
    const body = req.body;
    const year = req.params.year;
    const id = req.params.id;

    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!decodedToken.id) {
        return res.sendStatus(401).json({ error: "Token missing or invalid" });
    }

    let newSchedule = body;

    const schedule = await Schedule.updateOne(
        {
            year: year,
            team: decodedToken.id,
            "userSchedule._id": id
        },
        {
            "userSchedule.$.days": newSchedule
        },
        {
            new: true
        }
    );

    let newAcceptedShift = schedule.acceptedSchift;

    console.log(newAcceptedShift);
    res.sendStatus(200).json(newAcceptedShift);
});

module.exports = schedulesRouter;
