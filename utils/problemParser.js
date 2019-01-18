const fs = require('fs')
const { insDefault, typeDefault } = require('./setDefault')

module.exports = (filePath) => {
    let problem = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
    problem.name = typeDefault(problem.name, '', 'string')
    problem.plugins = insDefault(problem.plugins, [], Array)
    problem.score = typeDefault(problem.score, 0, 'number')
    problem.count = 0
    return problem
}