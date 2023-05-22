
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()
const secretKey = process.env.secretKey

const authentication = async (req, res, next) => {
    const token = req.headers.authorization
    if (!token) {
        return res.status(404).send({ "error ": 'unauthorized !' })
    }
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (decoded) {
            req.user = decoded
            next()
        }
        else {
            return res.status(404).send({ "error ": err.message })
        }
    })
}

const roles = {
    seller: {
        permissions: ["get", "delete", "post"]
    },
    user: {
        permissions: ["get"]
    }
}

function authorise(role) {
    return function (req, res, next) {
        if (req.user && roles[req.user.role] && roles[req.user.role].permissions.includes(req.method.toLowerCase())) {
            return next();
        } else {
            return res.status(403).send({ "error": "Unauthorized" })
        }
    }
}


module.exports = { roles, authentication, authorise }