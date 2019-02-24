'use strict'

// :: DAG -> { TaskId: Number }
const countInDegrees = dag => {
    const counts = {}
    Object.entries(dag).forEach(([vx, deps]) => {
        counts[vx] = counts[vx] || 0
        deps.forEach(dep => {
            counts[dep] = counts[dep] || 0
            counts[dep]++
        })
    })
    return counts
}

module.exports = {
    countInDegrees,
}
