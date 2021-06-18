const express = require('express');
require('dotenv').config()
require('./database')

// capture body
const app = express();
app.use(express.urlencoded({extended: true})); 
app.use(express.json());


// import routes
const url = require('./routes/route');


// route middlewares
app.use('/users', url);


// running server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`);
});