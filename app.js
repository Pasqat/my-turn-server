const config = require("./utils/config")
const express = require("express")
require("express-async-errors") // no need to use try/catch and next()
const app = express()
const helmet = require("helmet")
const cors = require("cors")
const schedulesRouter = require("./controllers/schedule")
const teamsRouter = require("./controllers/team")
const loginRouter = require("./controllers/login")
const middleware = require("./utils/middelware")
const logger = require("./utils/logger")
const mongoose = require("mongoose")

logger.info("connecting to", config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => {
        logger.info("connected to MongoDB")
    })
    .catch(error => {
        logger.error("error connectintg to MongoDB:", error.message)
    })

// Middleware
app.use(cors())
app.use(express.static("build"))
app.use(helmet())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use("/api/schedule",  schedulesRouter)
app.use("/api/team", teamsRouter)
app.use("/api/login", loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
