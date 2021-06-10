const router = require('./auth');

const route = require('express').Router();

router.get('/', (req, res) => {
    res.json({
        error: null,
        data: {
            title: "El usuario se encuentra activo",
            user: req.user
        }
    });
});

module.exports = router;