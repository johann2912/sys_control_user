const express = require('express');
require('dotenv').config()
require('./database')

// capture body
const app = express();
app.use(express.urlencoded({extended: true})); 
app.use(express.json());


// import routes
const user = require('./controllers/user');
const token = require('./controllers/token');
const singup = require('./controllers/singup');
const mqtt = require('./controllers/mqtt');

// route middlewares
app.use('/users', user);
app.use('/token', token);
app.use('/singup', singup);
app.use('/mqtt', mqtt);


// running server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`);
});