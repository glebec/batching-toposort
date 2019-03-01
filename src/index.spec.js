'use strict'

const { expect } = require('chai')

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
})
