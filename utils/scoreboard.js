const Complete = require('./complete')
const Problem = require('./problem')
const User = require('./user')

let socreboard = []

const get = () => {
    return socreboard.slice(0, Math.min(socreboard.length, 10))
}

const getAll = () => {
    return socreboard
}

const renew = async () => {
    socreboard = []
    let users = await User.all()
    for (let u of users) {
        socreboard.push(await renewUser(u))
    }
    socreboard = socreboard.sort((a, b) => {
        let ret = b.score - a.score
        if (ret === 0) {
            ret = a.time - b.time
        }
        return ret
    })
}

const renewByHash = async (hash) => {
    let us = await Complete.getByHash(hash).then((err, val) => {
        if (err || !val) return []
        return val
    })
    for (let u of us) {
        let user = await User.findUsersById(u.uid).then(({ err, val }) => {
            if (err || !val) return null
            return val[0]
        })
        if (user) {
            let s = renewUser(user)
            let already = socreboard.find((value) => value.uid === u.uid)
            if (already) {
                already.score = s.score
                already.time = s.time
            } else {
                socreboard.push(s)
            }
        }
    }
    socreboard = socreboard.sort((a, b) => {
        let ret = b.score - a.score
        if (ret === 0) {
            ret = a.time - b.time
        }
        return ret
    })
}

const renewUser = async (user) => {
    // TODO: 校验重复内容
    let ps = await Complete.getByUid(user.uid).then(({ err, val }) => {
        if (err || !val) return []
        return val
    })
    let score = 0
    let time = 0
    for (let p of ps) {
        score += (await Problem.action(
            Problem.get(p.hash),
            'score',
            { uid: user.uid, hash: p.hash })).score
        time = Math.max(time, p.time.getTime())
    }
    return { uid: user.uid, name: user.user, score, time }
}

module.exports = {
    get,
    getAll,
    renew,
    renewByHash
}