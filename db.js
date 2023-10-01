const mongoose = require('mongoose')
// const url = 'mongodb://localhost:27017/mycontacts-backend';
const url = 'mongodb+srv://saifwork30:75yZD7ir7dFzofjv@cluster0.vcdnqdm.mongodb.net/';

module.exports.connectDb = async () => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4,
    })
    const con = mongoose.connection
    con.on('open', () => {
        console.log('connected...')
    })
};
