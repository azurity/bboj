const bodyParser = require('body-parser')
const path = require('path')
const Complete = require(path.resolve(process.cwd(), './utils/complete'))

module.exports = {
    render(problem, { hash }) {
        return (`
        <p>
            <span class="badge" id="score-${hash}">分数:${problem.score}</span>
            <span class="badge" id="count-${hash}">完成人数:${problem.count}</span>
        </p>
        <p>${problem.description}</p>
        <form class="form-inline">
            <input type="text" class="form-control" placeholder="flag">
            <button type="button" class="btn btn-primary" onclick="
            fetch(\`http://localhost:3000/submit/${hash}?uid=\${window.app.user.uid}\`,
            {
                method:'POST',
                mode:'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({flag:'123'})
            }).then((val)=>{
                return val.json()
            }).then((val)=>{
                console.log(val)
            })
            ">提交</button>
        </form>`)
    },
    async post(problem, { uid, hash, req, res }) {
        await new Promise((resolve, reject) => {
            bodyParser.json()(req, res, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
        console.log(req.body)
        Complete.add(uid, hash, 1, '')
        return true
    },
    async score(problem, { uid, hash }) {
        return { uid, hash, score: problem.score }
    }
}