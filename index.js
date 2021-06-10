const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

require('dotenv').config()

const app = express();

// capture body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

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

// import routes
const authRoutes = require('./routes/auth');
const validateToken = require('./routes/validate-token');
const activo = require('./routes/admin');


// route middlewares
app.use('/users', authRoutes);
app.use('/users/:id/active', validateToken, activo);

app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

// running server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`);
});