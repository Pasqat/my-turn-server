const mongoose = require("mongoose");

const userScheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, "No name provided"]
    },
    userId: String,
    month: {
        type: Number,
        required: [true, "What month?"]
    },
    days: {
        type: [String]
    }
});

const scheduleSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, "The year is mandatory, please"]
    },
    userSchedule: [userScheduleSchema],
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }
});

scheduleSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
