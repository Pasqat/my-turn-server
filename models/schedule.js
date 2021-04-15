const mongoose = require("mongoose")

const acceptedSchiftSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true
    },
    color: String
})

const userScheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'No name provided']
    },
    userId: String,
    month: {
        type: Number,
        required: [true, 'What month?']
    },
    days: {
        type: [String],
    }
})

const scheduleSchema = new mongoose.Schema({
    teamName: String,
    teamId: String,
    acceptedSchift: [acceptedSchiftSchema],
    year: {
        type: Number,
        required: [true, 'The year is mandatory, please']
    },
    userSchedule: [userScheduleSchema]
})

scheduleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Schedule', scheduleSchema)
