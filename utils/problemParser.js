const fs = require('fs')
const path = require('path')
const { insDefault, typeDefault } = require('./setDefault')

module.exports = function (problemPath) {
    let problem = JSON.parse(fs.readFileSync(path.resolve(problemPath, 'config.json'), { encoding: 'utf8' }))
    problem.path = insDefault(problem.path, [], Array).map((value) => {
        return typeDefault(value, '', 'string')
    })
    problem.path.push('_')
    problem.plugin = insDefault(problem.plugin, [], Array)
    return problem
}