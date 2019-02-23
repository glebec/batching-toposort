'use strict'

const { expect } = require('chai')

const { invertDAG, mapObjVals } = require('./utils')

describe('invertDAG', () => {
    it('inverts an empty DAG', () => {
        const DAG = {}
        expect(invertDAG(DAG)).to.deep.equal({})
    })

    it('inverts a small DAG', () => {
        const DAG = {
            a: ['b'],
            b: [],
        }
        expect(invertDAG(DAG)).to.deep.equal({
            a: [],
            b: ['a'],
        })
    })

    it('inverts a medium DAG', () => {
        const DAG = {
            a: ['b', 'c'],
            b: ['c'],
            c: [],
            d: [],
        }
        expect(invertDAG(DAG)).to.deep.equal({
            a: [],
            b: ['a'],
            c: ['a', 'b'],
            d: [],
        })
    })

    it('inverts a bigger DAG', () => {
        const DAG = {
            a: ['c', 'f'], // `a` is a dependency of `c` and `f`
            b: ['d', 'e'],
            c: ['f'],
            d: ['f', 'g'],
            e: ['h'],
            f: ['i'],
            g: ['j'],
            h: ['j'],
            i: [],
            j: [],
        }
        expect(invertDAG(DAG)).to.deep.equal({
            a: [],
            b: [],
            c: ['a'],
            d: ['b'],
            e: ['b'],
            f: ['a', 'c', 'd'],
            g: ['d'],
            h: ['e'],
            i: ['f'],
            j: ['g', 'h'],
        })
    })
})

describe('mapObjVals', () => {
    it('transforms the values of an object', () => {
        expect(
            mapObjVals(
                {
                    a: 2,
                    b: 0,
                    c: 9,
                },
                x => x * 3
            )
        ).to.deep.equal({
            a: 6,
            b: 0,
            c: 27,
        })
    })
})
