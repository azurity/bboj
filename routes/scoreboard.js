const express = require('express')
const { scoreList } = require('../utils/competition')

const router = express.Router()

router.get('/', (req, res) => {
    scoreList((list) => {
        res.render('scoreboard', { scorelist: list })
    })
})

module.exports = router