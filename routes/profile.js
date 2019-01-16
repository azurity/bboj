const express = require('express')
const { userComplete } = require('../utils/complete')

const router = express.Router()

router.get('/:user', (req, res) => {
    userComplete(req.params.user, (complete) => {//不管是不是存在这个用户
        res.render('profile', {
            user: req.params.user,
            me: req.params.user === req.session.user,
            complete
        })
    })
})

module.exports = router