const mongoose = require('mongoose')
require('dotenv').config()
mongoose.set('strictQuery', false);

const connectDB = () => {
    mongoose.connect(process.env.MONGO_DB_KEY, () => {
        console.log('mongodb connected');
    })
}

connectDB()