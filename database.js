const mongoose = require('mongoose');

// Conexión data base
const url = `mongodb://192.168.1.92:27017/test` 
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => console.error(err))

const db = mongoose.connection
db.once('open', _ => {
    console.log(`Database connected: ${url}`)
})

db.on('error', err => {
    console.error(`connection error: ${err}`)
})
