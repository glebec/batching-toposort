'use strict'

const { countInDegrees } = require('./utils')

// :: (Number -> Bool) -> { String: Number } -> [String]
const filterByDegree = predicate => counts =>
    Object.entries(counts)
        .filter(([_, deg]) => predicate(deg))
        .map(([id, _]) => id)

// :: { String: Number } -> [String]
const getRoots = filterByDegree(deg => deg === 0)

// :: { String: Number } -> [String]
const getNonRoots = filterByDegree(deg => deg !== 0)

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
