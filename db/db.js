const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

const connectDB = ()=> {
     mongoose.connect('mongodb+srv://Bilal:Bilal@contactmanager.q79x0.mongodb.net/hellogram?retryWrites=true&w=majority' , ()=> {
    console.log('mongodb connected');
})}

connectDB()