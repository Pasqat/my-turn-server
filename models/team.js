const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        minLength: 4,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    passwordHash: String,
    schedules: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule"
        }
    ]
})

teamSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash is a secret 🤫
        delete returnedObject.passwordHash
    }
})

teamSchema.plugin(uniqueValidator)

const Team = mongoose.model("Team", teamSchema)

module.exports = Team
