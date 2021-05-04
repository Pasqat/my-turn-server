const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const teamsRouter = require("express").Router();
const Team = require("../models/team");

teamsRouter.get("/", async (req, res) => {
    const teams = await Team.find({}).populate("schedules", {
        year: 1,
        userSchedule: 1,
    });
    res.json(teams);
});

teamsRouter.post("/", async (req, res) => {
    const body = req.body;

    const saltRound = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRound);

    const team = new Team({
        teamName: body.teamName,
        email: body.email,
        passwordHash,
    });

    const savedTeam = await team.save();
    res.json(savedTeam);
});

teamsRouter.get("/accepted-shift/", async (req, res) => {
    /**
     * accepted-shift route
     */
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    console.log("decodedToken", decodedToken.id);

    if (!req.token || !decodedToken.id) {
        return res.status(401).json({ error: "token missing or invalid" });
    }

    const team = await Team.findById(decodedToken.id, "acceptedShift");
    console.log(team);
    res.json(team);
});

teamsRouter.put("/accepted-shift/", async (req, res) => {
    const body = req.body;
    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    if (!req.token || !decodedToken.id) {
        return res.status(401).json({ error: "token missing or invalid" });
    }

    const team = await Team.findByIdAndUpdate(
        decodedToken.id,
        { acceptedShift: body },
        { upsert: true, new: true }
    );

    res.json(team);
});

module.exports = teamsRouter;
