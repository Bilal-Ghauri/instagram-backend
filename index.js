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
const bodyParser = require('body-parser')


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "*")
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

app.use(fileupload({ useTempFiles: true }))
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
