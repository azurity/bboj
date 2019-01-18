const crypto = require('crypto')
const db = require('./db')

const CompleteSchema = new db.Schema({
    cid: { type: String, unique: true },
    uid: Number,
    hash: String,
    result: Number,
    ext: String,
    time: { type: Date, default: Date.now() }
})

const Complete = db.model('Complete', CompleteSchema)

const get = (cid) => {
    return new Promise((resolve, reject) => {
        let query = Complete.find({})
        query.where('cid', cid)
        query.lean()
        query.exec((err, val) => {
            resolve({ err, val })
        })
    })
}

const add = (uid, hash, result, ext) => {
    Complete.insertMany([{ cid: toCid(uid, hash), uid, hash, result, ext }])
}

const change = (cid, result, ext) => {
    Complete.findOneAndUpdate({ cid }, { result, ext })
}

const getByUid = (uid) => {
    return new Promise((resolve, reject) => {
        let query = Complete.find({})
        query.where('uid', uid)
        query.lean()
        query.exec((err, val) => {
            resolve({ err, val })
        })
    })
}

const getByHash = (hash) => {
    return new Promise((resolve, reject) => {
        let query = Complete.find({})
        query.where('hash', hash)
        query.lean()
        query.exec((err, val) => {
            resolve({ err, val })
        })
    })
}

const toCid = (uid, hash) => {
    return crypto.createHash('sha256').update(uid + hash).digest('hex')
}

module.exports = {
    get,
    add,
    change,
    getByUid,
    getByHash,
    toCid
}