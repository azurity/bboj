const express = require('express')

const router = express.Router()

router.use((req, res, next) => {
    console.log(req.method, req.path)
    next()
})

router.get('/', (req, res) => {
    res.redirect('/main')
})

router.use('/main', require('./routes/index'))
router.use('/list', require('./routes/problemlist'))
router.use('/profile', require('./routes/profile'))

module.exports = router