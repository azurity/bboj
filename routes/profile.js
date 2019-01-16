const express = require('express')
const { userComplete } = require('../utils/complete')
const { alreadyEnrolment, enrolment } = require('../utils/competition')

const router = express.Router()

router.get('/:user', (req, res) => {
    userComplete(req.params.user, (complete) => {//不管是不是存在这个用户
        alreadyEnrolment(req.params.user, (hasEnrolment) => {
            res.render('profile', {
                user: req.params.user,
                me: req.params.user === req.session.user,
                complete,
                hasEnrolment
            })
        })
    })
})

module.exports = router