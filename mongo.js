require("dotenv").config()
const mongoose = require("mongoose")

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    console.log('connected to MongoDb')
  })
  .catch(error => {
    console.log('error connicting to MongoDB:', error.message)
  })

const acceptedSchiftSchema = new mongoose.Schema({
  tag: String,
  color: String
})

const scheduleSchema = new mongoose.Schema({
  teamName: String,
  teamId: String,
  acceptedSchift: [acceptedSchiftSchema],
  year: Number,
  userSchedule: [
    {
      name:String,
      userId: String,
      month: Number,
      days: [String]
    }
  ]
})

const Schedule = mongoose.model('Schedule', scheduleSchema)


const schedule = new Schedule({
  teamName: "CovidUTI",
  teamId: "733326af-6d26-49f4-8204-3f944f20c34d",
  acceptedSchift: [
    {
      tag: "morning",
      color: "#ff00ff",
    },
    {
      tag: "afternoon",
      color: "#ffff00",
    },
    {
      tag: "night",
      color: "#00ffff",
    }
  ],
  year: 2021,
  userSchedule: [
      {
        name: "Alessia",
        userId: "2fee0052-93ef-4512-a376-337634426df6",
        month: 4,
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
        ]
      },
      {
        name: "Genni",
        userId: "e0df72b8-574a-43b2-b462-d4bccb8b2bba",
        month: 4,
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
        ]
      }
  ]
})


schedule.save().then(result => {
  console.log('schedule saved!')
  mongoose.connection.close()
})


// Schedule.find({year: 2021, "userSChedule.3"}).then(result => {
//   console.log(result)
//   mongoose.connection.close()
// })
