const db = require('../db')

const CompetitionSchema = db.Schema({
    user: String,
    score: Number,
    time: Date
})
const Competition = db.model('Competition', CompetitionSchema)

const alreadyEnrolment = (user, callback) => {
    let query = Competition.find({})
    query.where('user', user)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            console.error(err)
            callback(false)
            return
        }
        callback(true)
    })
}

const enrolment = (user) => {
    Competition.insertMany([{ user, score: 0, time: 0 }], (err) => {
        if (err) {
            console.error(err)
        }
    })
}

const setUserTime = (user, time) => {
    Competition.findOneAndUpdate({ user }, { time }, (err) => {
        if (err) {
            console.error(err, user, time)
        }
    })
}

const setUserScore = (user, score) => {
    Competition.findOneAndUpdate({ user }, { score }, (err) => {
        if (err) {
            console.error(err, user, score)
        }
    })
}

const scoreList = (callback) => {
    let query = Competition.find({})
    query.lean()
    query.exec((err, list) => {
        if (err) {
            console.error(err)
            callback([])
            return
        }
        callback(list)
    })
}

module.exports = {
    alreadyEnrolment,
    enrolment,
    setUserTime,
    setUserScore,
    scoreList
}