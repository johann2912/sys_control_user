const router = require('express').Router();
const validateToken = require('../models/tableToken');
const jwt = require('jsonwebtoken');
const { ensureToken } = require('../middlewares/autorizacionToken');


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

// eliminar validacion del Token
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


module.exports = router;