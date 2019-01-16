const db = require('../db')

const CompleteSchema = new db.Schema({
    user: String,
    problem: String,
    time: { type: Date, default: Date.now() }
})
const Complete = db.model('Complete', CompleteSchema)

const addComplete = (user, problem) => {
    Complete.insertMany([{ user, problem }], (err) => {
        console.error(user, problem, err)
    })
}

const userComplete = (user, callback) => {
    let query = Complete.find({})
    query.where('user', user)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            console.error(err)
            return callback([])
        }
        callback(val)
    })
}

const problemComplete = (problem) => {
    let query = Complete.find({})
    query.where('problem', problem)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            console.error(err)
            return callback([])
        }
        callback(val)
    })
}

module.exports = {
    addComplete,
    userComplete,
    problemComplete
}