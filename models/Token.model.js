const mongoose = require("mongoose")

const tokenSchema = mongoose.Schema({
    token: { type: String, required: true },
    email: { type: String, required: true }
}, { versionKey: false })

const TokenModel = mongoose.model("blacklist", tokenSchema)

module.exports = { TokenModel }