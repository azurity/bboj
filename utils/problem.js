const crypto = require('crypto')
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

let problems = {}
let problemTree = { _: [] }
let plugins = {}

for (let f of fs.readdirSync(global.config.pluginPath)) {
    if (fs.statSync(path.resolve(global.config.pluginPath, f)).isDirectory()) {
        if (fs.existsSync(path.resolve(global.config.pluginPath, f, 'index.js'))) {
            plugins[f] = require(path.resolve(global.config.pluginPath, f, 'index.js'))
        }
    }
}

router.all('/:problemid', (req, res) => {
    if (!req.session.user) {
        res.render('error', { error: 403, reason: '请先登录' })
        return
    }
    if (!problems[req.params.problemid]) {
        res.render('error', { error: 404, reason: '没有这道题目' })
        return
    }
    try {
        let template = plugins[problems[req.params.problemid].template]
        for (let it of problems[req.params.problemid].plugin) {
            it(problems[req.params.problemid], req, res)
        }
        template(problems[req.params.problemid], req, res)
    } catch (err) {
        res.render('error', { error: 500, reason: '题目故障' })
        return
    }
})

const loadProblem = () => {
    let localProblems = []
    for (let f of fs.readdirSync(global.config.problem.path)) {
        let localPath = path.resolve(global.config.problem.path, f)
        if (fs.statSync(localPath).isDirectory()) {
            let problem
            try {
                problem = global.config.problem.parser(localPath)
            } catch (err) {
                continue
            }
            if (!problem) {
                continue
            }
            let hash = crypto.createHash('sha256').update(JSON.stringify(problem.name)).digest('hex').slice(0, 16)
            if (!!localProblems[hash]) {
                throw '重复的题目'
            }
            localProblems[hash] = problem
        }
    }
    for (let hash in problems) {
        if (!localProblems[hash]) {
            removeProblem(problems[hash])
        } else {
            localProblems[hash] = problems[hash]
        }
    }
    for (let hash in localProblems) {
        if (!problems[hash]) {
            createProblem(localProblems[hash])
        }
    }
    problems = localProblems
    renewProblemTree()
}

const getProblem = () => {
    return problems
}

const getProblemTree = () => {
    return problemTree
}

function createProblem(problem) {
    try {
        let template = plugins[problem.template]
        for (let it of problem.plugin) {
            if (!!it.create) {
                it.create(problem)
            }
        }
        if (!!template.create) {
            template.create(problem)
        }
    } catch (err) {
        console.log('题目创建故障:', problem.name)
        process.exit(1)
    }
}

function removeProblem(problem) {
    try {
        let template = plugins[problem.template]
        for (let it of problem.plugin) {
            if (!!it.remove) {
                it.remove(problem)
            }
        }
        if (!!template.remove) {
            template.remove(problem)
        }
    } catch (err) {
        console.log('题目移除故障:', problem.name)
        process.exit(1)
    }
}

function renewProblemTree() {
    problemTree = { _: [] }
    for (let hash in problems) {
        let root = problemTree
        for (let p of problems[hash].path) {
            if (!root[p]) {
                root[p] = { _: [] }
            }
            root = root[p]
        }
        root.push({ hash, problem: problems[hash] })
    }
}

module.exports = {
    router,
    loadProblem,
    getProblem,
    getProblemTree
}