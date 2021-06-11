const router = require('./auth');

const route = require('express').Router();

router.get('/activo', (req, res) => {
    res.json({
        error: null,
        data: {
            estado: "El usuario se encuentra activo",
            user: req.user
        }
    });    
});

module.exports = router;