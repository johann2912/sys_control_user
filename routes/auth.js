const router = require('express').Router();
const User = require('../models/User');

router.post('/register', async(req, res) => {
    
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password
    });

    try {
        const userDB = await user.save();
        res.json ({
            error: null,
            data: userDB
        });
    } catch (error) {
        res.status(400).json({error});
    }

    res.json({
        error: null,
        data: 'data de registro'
    });
});

module.exports = router;