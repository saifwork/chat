const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/mycontacts-backend';

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
