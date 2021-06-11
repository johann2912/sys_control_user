const router = require('express').Router();
const User = require('../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');

const api = require('../models/api');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

router.post('/authorization', async (req, res) => {
    // validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Email no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña no válida' })
    
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })
})



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

    try {
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser
        })
    } catch (error) {
        res.status(400).json({error})
    }
})


router.delete('/:id', async (req, res) => {
    const user = await User.findOne({ email: req.params.id });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    let respuesta = await User.deleteOne({ _id: user._id });
    res.status(200).send(`Ususario eliminado con exito ${respuesta}`)
})

/*
router.put('/:id', async (req, res) => {
    const user = await User.findOne({ email: req.params.id });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    console.log(user);

   

})

/************************************** mqtt *********************************** 
const random = async function  () {
    let log = await DATO_CURIOSO.get("fact");
    setDescription(log.data.fact)
    return await DATO_CURIOSO.get("fact");
} 


var client = mqtt.connect('mqtt://mqtt.lyaelectronic.com:1883', {
    username: '',
    password: ''
  });

    let infoUser = await User.findOne({ email: req.params.id });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
  client.on('connect', function() { // When connected
      console.log("Connected to CloudMQTT");
    // Subscribe to the temperature
    client.subscribe('Motion', function() {
      // When a message arrives, do something with it
      client.on('message', function(topic, client, packet) {
        // ** Need to pass message out **
      });
    });
  
  });
*/

module.exports = router;