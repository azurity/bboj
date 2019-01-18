const mongoose = require('mongoose')

mongoose.connect('mongodb://192.168.91.128:27017/bboj')

module.exports = mongoose