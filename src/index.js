'use strict'

const { countInDegrees, getRoots, getNonRoots } = require('./utils')

// :: { dependencyId: dependentId } -> [[taskId]]
const batchingToposort = dag => {
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

    if (getNonRoots(indegrees).length) {
        throw Error('Cycle(s) detected; toposort only works on acyclic graphs')
    }

    return sorted
}

module.exports = batchingToposort
