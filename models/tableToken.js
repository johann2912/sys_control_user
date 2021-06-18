const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('validateToken', tokenSchema);
