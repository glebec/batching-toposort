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

module.exports = {
    countInDegrees,
}
