require('./db/db')
require('dotenv').config()
const express = require("express")
const app = express()
const userRoute = require('./routers/Users/User')
const cors = require('cors')
const cloudinary = require('cloudinary').v2
const fileupload = require('express-fileupload')
const postRoute = require('./routers/Post/Post')

let PORT = process.env.PORT || 5000

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


app.listen(PORT, () => {
    console.log('App is running on port 5000');
})