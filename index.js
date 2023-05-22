const express = require("express")
const app = express()

require('dotenv').config()
const PORT = process.env.PORT

app.use(express.json())

const { userRoute } = require("./routes/user.route")
app.use("/", userRoute)

const { connection } = require("./config/db")
app.listen(PORT, async () => {
    try {
        await connection;
        console.log("Server is listening at ::", PORT)
    } catch (error) {
        console.log(error)
    }
})
