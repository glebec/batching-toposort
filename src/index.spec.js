'use strict'

const { expect } = require('chai')
const jsc = require('jsverify')

const batchingToposort = require('./index')

describe('batchingToposort', () => {
    it('toposorts an empty graph', () => {
        expect(batchingToposort({})).to.deep.equal([])
    })

    it('toposorts a simple DAG', () => {
        expect(
            batchingToposort({
                a: ['b'],
                b: ['c'],
                c: [],
            })
        ).to.deep.equal([['a'], ['b'], ['c']])
    })

    it('toposorts a richer DAG', () => {
        expect(
            batchingToposort({
                a: ['c'],
                b: ['c'],
                c: [],
            })
        ).to.deep.equal([['a', 'b'], ['c']])
    })

    it('toposorts a complex DAG', () => {
        expect(
            batchingToposort({
                a: ['c', 'f'],
                b: ['d', 'e'],
                c: ['f'],
                d: ['f', 'g'],
                e: ['h'],
                f: ['i'],
                g: ['j'],
                h: ['j'],
                i: [],
                j: [],
            })
        ).to.deep.equal([
            ['a', 'b'],
            ['c', 'd', 'e'],
            ['f', 'g', 'h'],
            ['i', 'j'],
        ])
    })

    it('errors on a small cyclic graph', () => {
        const dg = {
            a: ['b'],
            b: ['a'],
            c: [],
        }
        const sortCyclicGraph = () => {
            batchingToposort(dg)
        }
        expect(sortCyclicGraph).to.throw(Error)
    })

    it('errors on a larger cyclic graph', () => {
        const dg = {
            a: ['b', 'c'],
            b: ['c'],
            c: ['d', 'e'],
            d: ['b'],
            e: [],
        }
        const sortCyclicGraph = () => {
            batchingToposort(dg)
        }
        expect(sortCyclicGraph).to.throw(Error)
    })

    describe('properties:', () => {
        // Helpers
        const { constant: pure, tuple: tupleGen } = jsc.generator
        const boolGen = jsc.bool.generator
        const asciinestringGen = jsc.asciinestring.generator

        // Default array gen grows by log2 of `size` param. This is linear.
        // :: Generator a -> Generator [a]
        const arrayGen = gen =>
            jsc.generator.bless(size =>
                Array(jsc.random(0, size))
                    .fill(gen)
                    .map(g => g(size))
            )

        // :: (Int, Generator a) -> Generator [a]
        const replicate = (n, g) =>
            n === 0
                ? pure([]) // `tuple` cannot be empty
                : tupleGen(Array(n).fill(g))

        // :: [a] -> [a]
        const dedupe = arr => [...new Set(arr)]

        // :: Generator NonEmptyString
        const idGen = arrayGen(asciinestringGen).map(dedupe)

        // :: (String, DAG) -> DAG
        const removeVx = (rmId, dag) =>
            Object.entries(dag).reduce((newDag, [id, deps]) => {
                if (id !== rmId) newDag[id] = deps.filter(dep => dep !== rmId)
                return newDag
            }, {})

        // :: (String, String, Dag) -> Dag
        const removeEdge = (edgeStart, edgeEnd, dag) =>
            Object.entries(dag).reduce((newDag, [id, deps]) => {
                newDag[id] = deps.filter(
                    dep => !(id === edgeStart && dep === edgeEnd)
                )
                return newDag
            }, {})

        // "environment" of arbitrary instances
        const env = {
            dag: jsc.bless({
                generator: idGen.flatmap(vertexIds => {
                    const numVxs = vertexIds.length
                    const numEdges = numVxs * (numVxs - 1) / 2
                    return replicate(numEdges, boolGen).flatmap(edgeBools => {
                        const dag = {}
                        let edgeIdx = 0
                        for (let vx = 0; vx < numVxs; vx++) {
                            const vxId = vertexIds[vx]
                            dag[vxId] = dag[vxId] || []
                            for (let dep = vx + 1; dep < numVxs; dep++) {
                                const dependentId = vertexIds[dep]
                                const useEdge = edgeBools[edgeIdx++]
                                if (useEdge) dag[vxId].push(dependentId)
                            }
                        }
                        return pure(dag)
                    })
                }),
                shrink: jsc.shrink.bless(dag => {
                    const dags = []
                    Object.entries(dag).forEach(([id, deps]) => {
                        dags.push(removeVx(id, dag))
                        deps.forEach(dep => {
                            dags.push(removeEdge(id, dep, dag))
                        })
                    })
                    return dags
                }),
                show: a => JSON.stringify(a),
            }),
        }

        const opts = {
            tests: 100,
            size: 50,
        }

        it('DAGs sort without error', () => {
            jsc.assert(
                jsc.forall('dag', env, dag => {
                    batchingToposort(dag)
                    return true
                }),
                opts
            )
        })

        it('toposorted DAGs do not lose tasks', () => {
            jsc.assert(
                jsc.forall('dag', env, dag => {
                    const sorted = batchingToposort(dag)
                    const flattened = [].concat.apply([], sorted)
                    return flattened.length === Object.keys(dag).length
                }),
                opts
            )
        })

        it('toposorted DAGs contain no empty sublists', () => {
            jsc.assert(
                jsc.forall('dag', env, dag => {
                    const sorted = batchingToposort(dag)
                    return !sorted.some(sublist => !sublist.length)
                }),
                opts
            )
        })

        it('toposort is externally pure', () => {
            jsc.assert(
                jsc.forall('dag', env, dag => {
                    Object.values(dag).forEach(list => Object.freeze(list))
                    Object.freeze(dag)
                    batchingToposort(dag)
                    return true
                }),
                opts
            )
        })
    })
})
