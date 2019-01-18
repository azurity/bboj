const express = require('express')
const Complete = require('./utils/complete')
const Problem = require('./utils/problem')
const Scoreboard = require('./utils/scoreboard')
const { insDefault, typeDefault } = require('./utils/setDefault')
const User = require('./utils/user')

const app = express()

app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    next()
})

app.get('/view', (req, res) => {
    let uid = typeDefault(parseInt(req.query.uid), 0, 'number')
    let problemId = typeDefault(req.query.problem, '', 'string')
    let problem = Problem.get(problemId)
    if (!problem) {
        res.send('题目不存在')
        return
    }
    User.findUsersById(uid)
        .then(({ err, val }) => {
            if (err || !val || val.length === 0) {
                res.send('无法参与提交，请先报名')
            } else {
                Complete.get(Complete.toCid(uid, problemId))
                    .then(({ err, val }) => {
                        if (!err && !!val && val.length > 0 && val[0].result > 0) {
                            res.send(`<div class="alert alert-success" role="alert">已经完成当前题目</div>`)
                            return
                        }
                        Problem.action(problem, 'render', { hash: problemId })
                            .then((value) => {
                                res.send(value)
                            })
                    })
            }
        })
})

app.post('/submit/:id', (req, res) => {
    let uid = typeDefault(parseInt(req.query.uid), 0, 'number')
    let id = typeDefault(req.params.id, '', 'string')
    let problem = Problem.get(id)
    if (uid === 0) {
        res.json({ success: false, reason: '提交不完整' })
        return
    }
    if (!problem) {
        res.json({ success: false, reason: '题目丢失' })
        return
    }
    Problem.action(problem, 'post', { uid, hash: id, req, res })
        .then((value) => {
            res.json(value)
        }).then(() => {
            Complete.getByHash((err, val) => {
                if (!err && !!val) {
                    problem.count = val.filter((it) => it.result > 0).length
                } else {
                    console.error(err)
                }
                Problem.action(problem, 'renew', { uid, hash: id }).then(() => {
                    Scoreboard.renewByHash(id)
                })
            })
        })
})

app.get('/has-user', (req, res) => {
    let uid = typeDefault(parseInt(req.query.uid), 0, 'number')
    if (uid === 0) {
        res.json(true)
    }
    User.hasUser(uid)
        .then((val) => {
            res.json(val)
        })
})

app.get('/enroll', (req, res) => {
    let uid = typeDefault(parseInt(req.query.uid), 0, 'number')
    let name = typeDefault(req.query.name, '', 'string')
    if (uid === 0 || name === '') {
        res.json({ success: false, reason: '用户无效' })
        return
    }
    name = Buffer.from(name, 'base64').toString('utf8')
    User.addUser(uid, name)
        .then((err) => {
            if (err) {
                console.error(uid, name, err)
                res.json({ success: false, reason: '报名失败' })
            } else {
                res.json({ success: true })
            }
        })
})

app.get('/list', (req, res) => {
    let result = []
    let all = Problem.all()
    for (let it in all) {
        result.push([it, all[it].name])
    }
    res.json(result)
})

app.get('/scoreboard', (req, res) => {
    res.json(Scoreboard.get())
})

try {
    Problem.renew()
    Scoreboard.renew()
} catch (err) {
    console.log(err)
    process.exit(1)
}

module.exports = app