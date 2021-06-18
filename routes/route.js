const router = require('express').Router();
const User = require('../models/User');
const validateToken = require('../models/tableToken');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const mqtt = require('mqtt');


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

// Verificar Token
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



// registrar
router.post('/register', async (req, res) => {

    // Validation user
    const schemaRegister = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().min(3).max(1024).required()
    })

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

    //console.log("User: ", user)
    // crear token 
    const token = jwt.sign({user}, process.env.TOKEN_SECRET);
    const confirmacion = await validateToken.create({
        id: user._id,
        token: token
    })
    console.log(confirmacion);

    res.json({user, token});

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

// Verificar Token
router.post('/verificacion', ensureToken, (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            res.json({
                message: 'Ha ocurrido un error'
            })
        } else {
            res.json({
                text: 'verificacion realizada, usuario activo',
                data
            })
        }
    })
})

// eliminar Token
router.delete('/verificacion/:id', ensureToken, async (req, res) => {
    if(req.message == 0){
        res.status(400).send('Token invalido')
    } else {
        const buscando = await validateToken.findOne({id: req.params.id})
        console.log(buscando)
        if(buscando.length == 0) return res.status(400).json({ error: 'Token no encontrado'})
        let lalala = await validateToken.deleteOne({ _id: buscando._id })
        console.log(lalala)
        res.status(200).send('Token eliminado con exito')
    }
})


// eliminar Usuario
router.delete('/:id', ensureToken, async (req, res) => {
    if(req.message == 0){
        res.status(400).send('Token invalido');
    } else {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
        await User.deleteOne({ _id: user._id });
        res.status(200).send('Ususario eliminado con exito');
    }
})

// editar 
router.put('/:id', ensureToken, async function(req, res, next) {
    if(req.message == 0){
        res.status(400).send('Token invalido');
    } else {
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        let respuesta = await User.updateOne({_id: req.params.id}, req.body)
        res.status(200).send('Usuario modificado con exito');
    }
})

// MQTT
router.post('/messages/send', ensureToken, async (req, res) => { 
    //console.log(req.message)
    if(req.message == 0){
        res.status(400).send('Credenciales Invalidas');
    } else {
        // Api
        async function getApi() 
            {
            let response = await axios.get('https://catfact.ninja/fact?limit=1&max_length=140');
            return JSON.stringify(response.data.fact);
            }
        const response = await getApi()
        //console.log(response)
            
        // id User
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ error: 'Email no encontrado' });
        res.status(200).send('El usuario esta siendo escuchado');
        const id = user._id
        //console.log(id)  


        // Conexión MQTT
            var client = mqtt.connect('mqtt://mqtt.lyaelectronic.com');
        
            client.on('connect', function () {
            client.subscribe('lyatest/codigo_prueba', function (err) {
                if (!err) {
                client.publish('lyatest/codigo_prueba', `Frase Curiosa:${response} Id:${id}`)
                }
            })
            }) 
    }
})
     
module.exports = router;