const User = require('../models/User');
const validateToken = require('../models/tableToken');

// Comprobar autorizacion del usuario con token
const ensureToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        req.message = await Comparar(req);
        next();
    } else {
        res.sendStatus(403);
    }
}

const Comparar = async (req)  => {
    let validate = []
    if(req.params.id){
        validate = await validateToken.find({id:req.params.id, token: req.token})
    } else {
        let user = await User.find({email:req.body.email})
        console.log(user)
        if(user.length > 0){
            validate = await validateToken.find({id:user[0]._id, token: req.token})
        }
    }
    
    let message
    if(validate.length == 0){
        message = 0
    }else{
        message = 1
    }
    return message
}

module.exports = { ensureToken }