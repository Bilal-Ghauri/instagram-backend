require('dotenv').config()
const express = require("express")
const app = express()
const userRoute = require('./routers/Users/User')
const cors = require('cors')
const cloudinary = require('cloudinary').v2
const fileupload = require('express-fileupload')
const postRoute = require('./routers/Post/Post')
const connectDB = require('./db/db')
const port = process.env.PORT || 5050



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

app.use(fileupload({ useTempFiles: true }))

app.use(cors())
app.use(express.json())

app.use('/user', userRoute)
app.use('/post', postRoute)


app.get('/', async (req, res) => {
    res.send('hello')
})

const startServer = async () => {
    try {
        await connectDB()
        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}
startServer()
