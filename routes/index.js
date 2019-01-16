const crypto = require('crypto')
const bodyParser = require('body-parser')
const express = require('express')
const randomstring = require('randomstring')
const db = require('../db')

const UserSchema = new db.Schema({
    username: String,
    password: String
})
const User = db.model('User', UserSchema)
const router = express.Router()

router.get('/', (req, res) => {
    if (req.session.user == null) {
        res.redirect(req.baseUrl + '/login')
        return
    }
    res.render('index', { username: req.session.user })
})

router.get('/login', (req, res) => {
    if (req.session.user != null) {
        res.redirect(req.baseUrl + '..')
        return
    }
    req.session.salt = randomstring.generate(8)
    res.render('login', { random: req.session.salt })
})

router.get('/register', (req, res) => {
    if (req.session.user != null) {
        res.status(403).render('error', { error: 403, reason: '请先退出登录' })
        return
    }
    res.render('register')
})

router.post('/login', bodyParser.json(), (req, res) => {
    if (typeof req.session.salt !== 'string') {
        res.status(403).render('error', { error: 403 })
        return
    }
    if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
        res.json({
            success: false,
            error: '缺少用户名或密码'
        })
        return
    }
    let query = User.find({})
    query.where('username', req.body.username)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            res.json({
                success: false,
                error: '致命错误'
            })
            return
        }
        if (val.length === 0) {
            res.json({
                success: false,
                error: '没有这个用户'
            })
            return
        }
        let correct = crypto.createHash('sha256').update(val[0].password + req.session.salt).digest('hex')
        if (req.body.password !== correct) {
            res.json({
                success: false,
                error: '密码错误'
            })
            return
        }
        req.session.user = req.body.username
        res.json({
            success: true
        })
    })
})

router.post('/register', bodyParser.json(), (req, res) => {
    if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
        res.json({
            success: false,
            error: '缺少用户名或密码'
        })
        return
    }
    let query = User.find({})
    query.where('username', req.body.username)
    query.lean()
    query.exec((err, val) => {
        if (err) {
            res.json({
                success: false,
                error: '致命错误'
            })
            return
        }
        if (val.length !== 0) {
            res.json({
                success: false,
                error: '用户已经存在'
            })
            return
        }
        User.insertMany([{ username: req.body.username, password: req.body.password }], (err) => {
            if (err) {
                res.json({
                    success: false,
                    error: '致命错误'
                })
                return
            }
            req.session.user = req.body.username
            res.json({
                success: true
            })
        })
    })
})

router.get('/allTeam', (req, res) => {
    let query = User.find({})
    query.lean()
    query.exec((err, val) => {
        if (err) {
            res.render('error', { error: 500 })
            return
        }
        res.render('allTeam', val.map(value => value.username))
    })
})

module.exports = router