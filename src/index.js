'use strict'

const { countInDegrees } = require('./utils')

// { String: Number } -> [String]
const getRoots = counts =>
    Object.entries(counts)
        .filter(([_, deg]) => deg === 0)
        .map(([id, _]) => id)

// { dependencyId: dependentId } -> [[taskId]]
function batchingToposort(dag) {
    const indegrees = countInDegrees(dag)
    const sorted = []

    let roots = getRoots(indegrees)

    while (roots.length) {
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

        roots = newRoots
    }

    return sorted
}

module.exports = batchingToposort
