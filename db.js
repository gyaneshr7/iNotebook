const dotenv = require('dotenv');
const {mongoose} = require('mongoose');

dotenv.config(); 
const mongoURI = process.env.MONGO_URI;

const connectToMongo = () =>  {
    mongoose.connect(mongoURI).then(() => {
        console.log('Mongodb connected successfully.')
    })
}

module.exports = connectToMongo;