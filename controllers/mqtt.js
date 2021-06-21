const axios = require('axios');
const { json } = require('body-parser');
const mqtt = require('mqtt');
const { ensureToken } = require('../middlewares/autorizacionToken');
const router = require('express').Router();
const User = require('../models/User');

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
        const response = await getApi();
        //console.log(response)
            
        // id User
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ error: 'Email no encontrado' });
        res.status(200).send('El usuario esta siendo escuchado');
        const id = user._id

        let messageSalida = res.json({ Id: id, frase: response })

        // Conexión MQTT
            var client = mqtt.connect('mqtt://mqtt.lyaelectronic.com');
        
            client.on('connect', function () {
                client.subscribe('lyatest/codigo_prueba', function (err) {
                    if (!err) {
                    client.publish('lyatest/codigo_prueba', messageSalida)
                    }
                })
            }) 
    }
})

module.exports = router;