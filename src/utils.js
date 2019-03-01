'use strict'

// :: DAG -> { TaskId: Number }
const countInDegrees = dag => {
    const counts = {}
    Object.entries(dag).forEach(([vx, dependents]) => {
        counts[vx] = counts[vx] || 0
        dependents.forEach(dependent => {
            counts[dependent] = counts[dependent] || 0
            counts[dependent]++
        })
    })
    return counts
}

// :: (Number -> Bool) -> { String: Number } -> [String]
const filterByDegree = predicate => counts =>
    Object.entries(counts)
        .filter(([_, deg]) => predicate(deg))
        .map(([id, _]) => id)

// :: { String: Number } -> [String]
const getRoots = filterByDegree(deg => deg === 0)

// :: { String: Number } -> [String]
const getNonRoots = filterByDegree(deg => deg !== 0)

module.exports = {
    countInDegrees,
    getRoots,
    getNonRoots,
}
