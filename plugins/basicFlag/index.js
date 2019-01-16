const bodyParser = require('body-parser')
const fs = require('fs')

module.exports = function (data, req, res) {
    if (req.method === 'POST') {
        bodyParser.text()(req, res, () => {
            if (req.body === data.flag) {
                res.json({ success: true })
            } else {
                res.json({ success: false })
            }
        })
    }
}