const mongoose = require('mongoose');
const pwd = process.env.DB_PWD;
const url = `mongodb+srv://saifwork30:${pwd}@cluster0.vcdnqdm.mongodb.net/test`;

module.exports.connectDb = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            family: 4,
        });

        const con = mongoose.connection;

        con.on('error', (error) => {
            console.error('Connection error:', error);
        });

        con.once('open', () => {
            console.log('Connected to MongoDB');
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};




// const url = 'mongodb://localhost:27017/mycontacts-backend';