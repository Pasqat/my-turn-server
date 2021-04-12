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
  tag: String, color: String
})

const userScheduleSchema = new mongoose.Schema({
  name: String,
  userId: String,
  month: Number,
  days: [String]
})

const scheduleSchema = new mongoose.Schema({
  teamName: String,
  teamId: String,
  acceptedSchift: [acceptedSchiftSchema],
  year: Number,
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
