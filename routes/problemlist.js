const express = require('express')
const { getProblemTree } = require('../utils/problem')

const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user == null) {
        res.render('error', { error: 403, reason: '未登录' })
        return
    }
    res.render('problems', { problemTree: getProblemTree() })
})

module.exports = router