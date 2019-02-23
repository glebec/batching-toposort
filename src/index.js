'use strict'

const { invertDAG, mapObjVals } = require('./utils')

// { String: Number } -> [String]
const getRoots = counts =>
    Object.entries(counts)
        .filter(([_, deg]) => deg === 0)
        .map(([id, _]) => id)

// { dependencyId: dependentId } -> [[taskId]]
function batchingToposort(dag) {
    const indegrees = mapObjVals(invertDAG(dag), vxs => vxs.length)
    const sorted = []

    return solve(getRoots(indegrees))

    function solve(roots) {
        if (!roots.length) return sorted

        sorted.push(roots)

        const newRoots = []
        roots.forEach(root => {
            dag[root].forEach(dependent => {
                indegrees[dependent]--
                if (indegrees[dependent] === 0) {
                    newRoots.push(dependent)
                }
            })
        })

        return solve(newRoots)
    }
}

module.exports = batchingToposort
