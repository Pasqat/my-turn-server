const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path:  ", request.path)
    console.log("Body:  ", request.body)
    console.log("-".repeat(3))
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: "unknown endpoint"
    })
}

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return res.status(400).send({
            error: "Malformatted id"
        })
    } else if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler

}
