const db = require('./db')

const UserSchema = new db.Schema({
    user: String,
    uid: { type: Number, unique: true }
})

const User = db.model('User', UserSchema)

module.exports = {
    findUsersById(uid) {
        return new Promise((resolve, reject) => {
            let query = User.find({})
            query.where('uid', uid)
            query.lean()
            query.exec((err, val) => resolve({ err, val }))
        })
    },
    addUser(uid, user) {
        return new Promise((resolve, reject) => {
            User.insertMany([{ user, uid }], (err) => {
                resolve(err)
            })
        })
    },
    hasUser(uid) {
        return new Promise((resolve, reject) => {
            let query = User.find({})
            query.where('uid', uid)
            query.lean()
            query.exec((err, val) => {
                resolve(!err && !!val && val.length > 0)
            })
        })
    },
    all() {
        return new Promise((resolve, reject) => {
            let query = User.find({})
            query.lean()
            query.exec((err, val) => {
                if (err || !val) resolve([])
                resolve(val)
            })
        })
    }
}