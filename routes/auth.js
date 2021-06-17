const router = require('express').Router();
const User = require('../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const mqtt = require('mqtt');
const { Types } = require('mongoose');
const verifyToken = require('./validate-token');
const { text } = require('body-parser');


const schemaRegister = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(1024).required()
})

// autenticar
function ensureToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

router.post('/verificacion', ensureToken, (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            res.sendStatus(403)
        } else {
            res.json({
                text: 'verificacion realizada, usuario activo',
                data
            })
        }
    })
})

router.post('/authorization', ensureToken, async (req, res) => {
    // validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Credenciales no validas' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Credenciales no validas' })
    
    /*
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    });
    */
});




// registrar
router.post('/register', async (req, res) => {

    // Validation user
    const { error } = schemaRegister.validate(req.body)
    
    if (error) {
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }

    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json(
            {error: 'El usuario ya se  encuentra registrado'}
        )
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
 

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    });

    console.log("User: ", user)
    const token = jwt.sign({user}, process.env.TOKEN_SECRET);
    res.json({token});

    try {
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser
        });
    } catch (error) {
        res.status(400).json({error});
    }
})

// eliminar
router.delete('/:id', ensureToken, async (req, res) => {
    console.log(req.params.id)
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    let respuesta = await User.deleteOne({ _id: user._id });
    res.status(200).send('Ususario eliminado con exito');
})

// editar 
router.put('/:id', ensureToken, async function(req, res, next) {

    if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    let respuesta = await User.updateOne({_id: req.params.id}, req.body)
    res.status(200).send('Usuario modificado con exito');
    
})


router.post('/messages/send', ensureToken, async (req, res) => { 
    
    // Api
    async function getApi() 
        {
        let response = await axios.get('https://catfact.ninja/fact?limit=1&max_length=140');
        return JSON.stringify(response.data);
        }
    const response = await getApi()
    console.log(response)
        
    // id User
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Email no encontrado' });
    res.status(200).send('El usuario esta siendo escuchado');

    console.log(user._id)  

    // Conexión MQTT
        var client = mqtt.connect('mqtt://mqtt.lyaelectronic.com');
      
        client.on('connect', function () {
          client.subscribe('lyatest/codigo_prueba', function (err) {
            if (!err) {
              client.publish('lyatest/codigo_prueba', `frase curiosa: ${JSON.stringify(response)}, el Id del usuario es: ${user._id}`)
            }
          })
        }) 
})
     
module.exports = router;