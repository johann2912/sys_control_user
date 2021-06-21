const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/User');
require('dotenv').config()
const validateToken = require('../models/tableToken');


router.patch('/activar', async (req, res) => {

    let user = await User.findOne({email: req.body.email });
    console.log(user, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

    if(user){
        let pass = await bcrypt.compare(req.body.password, user.password)
        if(pass){
            console.log(pass, "####################bcrypt")

            req.body.validateToken = jwt.sign({user}, process.env.TOKEN_SECRET);

            // consultar si existe token
            token = await validateToken.findOne( {id: user._id});
            console.log(token, "assasasasasassasasasasa")

            if(token){
                let RESPUESTA = await validateToken.updateOne({ _id: token._id}, {
                    token:  req.body.validateToken
                })
                console.log(RESPUESTA, "#######################################")
            } else {
                let RESPUESTA = await validateToken.create({
                    id: user._id,
                    token:  req.body.validateToken
                })
                console.log(RESPUESTA, "#######################################")
            }
            res.status(200).send({message:"Usuario logueado", token: req.body.validateToken})
        } else {
            res.status(400).send('Error con la contraseña');
        }
    } else {
        res.status(400).send('Ocurrio un error, Intente de nuevo');
    }

})





module.exports = router;