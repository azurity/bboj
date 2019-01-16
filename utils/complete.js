const { setUserTime, setUserScore } = require('./competition')
const db = require('../db')
const { getProblem, renewCount, renewScore } = require('./problem')

const CompleteSchema = new db.Schema({
    user: String,
    problem: String,
    time: { type: Date, default: Date.now() }
})
const Complete = db.model('Complete', CompleteSchema)

const addComplete = (user, problem) => {
    let time = Date.now()
    Complete.insertMany([{ user, problem, time }], (err) => {
        if (err) {
            console.error(user, problem, err)
            return
        }
        problemComplete(problem, (list) => {
            renewCount(problem, list.length)
            renewScore(problem, list)
            for (let it of list) {
                renewUserScore(it.user)
            }
            setUserTime(user, time)
        })
    })
}

const userComplete = (user, callback) => {
    let query = Complete.find({})
    query.where('user', user)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            console.error(err)
            callback([])
            return
        }
        callback(val)
    })
}

const problemComplete = (problem, callback) => {
    let query = Complete.find({})
    query.where('problem', problem)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            console.error(err)
            callback([])
            return
        }
        callback(val)
    })
}

const renewCompleteCount = (problem) => {
    problemComplete(problem, (list) => {
        renewCount(problem, list.length)
    })
}

function renewUserScore(user) {
    let score = 0
    let problem = getProblem()
    for (let it of userComplete(user)) {
        score += problem[it.problem]
        /* TODO: 动态积分 */
    }
    setUserScore(user, problem)
}

module.exports = {
    addComplete,
    userComplete,
    problemComplete,
    renewCompleteCount
}