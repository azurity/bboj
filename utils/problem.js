const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Complete = require('./complete')
const { insDefault, typeDefault } = require('./setDefault')

const problemPath = path.resolve(process.cwd(), typeDefault(process.env.problemPath, 'problems', 'string'))
const problemParse = require(path.resolve(process.cwd(), typeDefault(process.env.problemParser, 'utils/problemParser')))
const pluginPath = path.resolve(process.cwd(), typeDefault(process.env.pluginPath, 'plugins', 'string'))

let problems = {}
let plugins = {}

for (let f of fs.readdirSync(pluginPath)) {
    if (fs.statSync(path.resolve(pluginPath, f)).isDirectory()
        && fs.existsSync(path.resolve(pluginPath, f, 'index.js'))) {
        plugins[f] = require(path.resolve(pluginPath, f, 'index.js'))
    }
}

const renew = async () => {
    let localProblems = {}
    for (let f of fs.readdirSync(problemPath)) {
        if (fs.statSync(path.resolve(problemPath, f)).isDirectory()
            && fs.existsSync(path.resolve(problemPath, f, 'config.json'))) {
            let problem = problemParse(path.resolve(problemPath, f, 'config.json'))
            problem.path = path.resolve(problemPath, f)
            let hash = crypto.createHash('sha256').update(f).digest('hex')
            problem.count = await Complete.getByHash(hash).then(({ err, val }) => {
                if (!err && !!val) return val.filter((it) => it.result > 0).length
                return 0
            })
            localProblems[hash] = problem
        }
    }
    for (let hash in problems) {
        if (!localProblems[hash]) {
            await action(problems[hash], 'release')
        } else {
            localProblems[hash] = problems[hash]
        }
    }
    for (let hash in localProblems) {
        if (!problems[hash]) {
            await action(localProblems[hash], 'create')
        }
    }
    problems = localProblems
}

const get = (hash) => {
    return problems[hash]
}

const all = () => {
    return problems
}

const action = async (problem, action, args) => {
    let value = args || {}
    for (let p of problem.plugins) {
        if (!!plugins[p] && !!plugins[p][action]) {
            value = await plugins[p][action](problem, value)
        }
    }
    return value
}

module.exports = {
    renew,
    get,
    all,
    action
}