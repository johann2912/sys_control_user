const User = require('../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const validateToken = require('../models/tableToken');

const { ensureToken } = require('../middlewares/autorizacionToken');

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

     
module.exports = router;