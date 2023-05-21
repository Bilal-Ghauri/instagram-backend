const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const db = process.env.MONGO_DB_KEY;

const connectDb = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDb;