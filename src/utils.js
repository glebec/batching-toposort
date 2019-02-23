'use strict'

// :: [[String, a]] -> { String: a }
const fromEntries = entries =>
    entries.reduce((obj, [k, v]) => {
        obj[k] = v
        return obj
    }, {})

// construct reversed adjacency list (swap edge directions) ~O(|V| + |E|)
// :: DAG -> DAG
const invertDAG = dag => {
    const newDAG = {}
    Object.entries(dag).forEach(([oldVx, vxs]) => {
        newDAG[oldVx] = newDAG[oldVx] || []
        vxs.forEach(newVx => {
            newDAG[newVx] = newDAG[newVx] || []
            newDAG[newVx].push(oldVx)
        })
    })
    return newDAG
}

// :: (Object a, (a -> b)) -> Object b
const mapObjVals = (obj, fn) =>
    fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]))

module.exports = {
    invertDAG,
    mapObjVals,
}
