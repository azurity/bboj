const express = require('express')
const { userComplete, problemComplete } = require('../utils/complete')
const { getProblemTree } = require('../utils/problem')

const router = express.Router()

router.use((req, res, next) => {
    if (req.session.user == null) {
        res.render('error', { error: 403, reason: '未登录' })
        return
    }
    next()
})

router.get('/', (req, res) => {
    userComplete(req.params.user, (complete) => {
        res.render('problems', {
            problemTree: getProblemTree(),
            complete
        })
    })
})

router.get('/finish/:id', (req, res) => {
    problemComplete(req.params.id, (val) => {
        res.json(val => val.user)
    })
})

module.exports = router