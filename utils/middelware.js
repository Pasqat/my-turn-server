const logger = require("./logger")
const Team = require("../models/team")
const jwt = require("jsonwebtoken")

const requestLogger = (request, response, next) => {
    logger.info("Method:", request.method)
    logger.info("Path:  ", request.path)
    logger.info("Body:  ", request.body)
    logger.info("-".repeat(3))
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: "unknown endpoint"
    })
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get("authorization")
    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        req.token = authorization.substring(7)
    }

    next()
}

const teamExtractor = async (req, res, next) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    const team = await Team.findById(decodedToken.id)
    req.team = team
    next()
}

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)

    if (error.name === "CastError") {
        return res.status(400).send({
            error: "Malformatted id"
        })
    } else if (error.name === "ValidationError") {
        return res.status(400).json({
            error: error.message
        })
    } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
            error: "invalid token"
        })
    } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({
            error: "token expired"
        })
    }

    logger.error(error)

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    tokenExtractor,
    teamExtractor,
    errorHandler
}
