//const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs')
const path = require('path')
const session = require('express-session')
const { insDefault, typeDefault } = require('./utils/setDefault')

const app = express()
const configPath = path.resolve(__dirname, typeDefault(process.env.CONFIG_PATH, 'config.json', 'string'))

try {
    let config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }))
    config.problem = typeDefault(config.problem, {}, 'object')
    config.problem.path = path.resolve(__dirname, typeDefault(config.problem.path, 'problems', 'string'))
    config.problem.parser = require(path.resolve(__dirname, typeDefault(config.problem.parser, './utils/problemParser', 'string')))
    config.view = typeDefault(config.view, {}, 'object')
    config.view.path = path.resolve(__dirname, typeDefault(config.view.path, 'views', 'string'))
    config.view.engine = typeDefault(config.viewEngine, 'ejs', 'string')
    config.session = typeDefault(config.problem, {}, 'object')
    config.session.maxAge = typeDefault(config.problem, 3600 * 1000, 'number')
    global.config = config
    app.use(session({
        secret: 'qweqweqwe',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: config.session.maxAge }
    }))
    app.set('views', config.view.path)
    app.set('view engine', config.view.engine)
    app.use('/', require('./service'))
    let problem = require('./utils/problem')
    app.use('/problem', problem.router)
    problem.loadProblem()
} catch (err) {
    console.log(err)
    process.exit(1)
}

app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.status(err.status || 500)
    res.render('error', { error: res.statusCode, message: err.message })
})

module.exports = app
