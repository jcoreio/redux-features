import featureReducersReducer from '../src/featureReducersReducer'
import {expect} from 'chai'
import sinon from 'sinon'
import {composeReducers} from 'mindfront-redux-utils'

describe('featureReducersReducer', () => {
  const reducer = featureReducersReducer()

  it('calls feature reducers in order', () => {
    const r1 = sinon.spy((state, action) => action.type[0] === 'a' ? {...state, a: 1} : state)
    const r2 = sinon.spy((state, action) => action.type[1] === 'b' ? {...state, b: 2} : state)
    const r3 = sinon.spy((state, action) => action.type[2] === 'c' ? {...state, c: 3} : state)

    const initState = {
      featureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      features: {
        a: {reducer: r1},
        b: {reducer: r2},
        c: {reducer: r3},
        d: {},
        e: {},
      }
    }

    expect(reducer(initState, {type: 'abc'})).to.deep.equal({...initState, a: 1, b: 2, c: 3})
    expect(reducer(initState, {type: '....'})).to.deep.equal(initState)
    expect(r1.calledBefore(r2)).to.be.true
    expect(r2.calledBefore(r3)).to.be.true

    const state2 = {
      featureStates: {
        a: 'LOADED',
      },
      features: {
        a: {reducer: r1},
        e: {},
      }
    }
    expect(reducer(state2, {type: 'abc'})).to.deep.equal({...state2, a: 1})

    const state3 = {}
    expect(reducer(state3, {type: 'abc'})).to.deep.equal(state3)

    const state4 = {
      featureStates: {
        a: 'LOADED',
      },
      features: {
        a: {},
      }
    }
    expect(reducer(state4, {type: 'abc'})).to.deep.equal(state4)
  })
  it('supports custom getFeatures', () => {
    const reducer = featureReducersReducer({getFeatures: state => state.theFeatures})

    const r1 = sinon.spy((state, action) => action.type[0] === 'a' ? {...state, a: 1} : state)
    const r2 = sinon.spy((state, action) => action.type[1] === 'b' ? {...state, b: 2} : state)
    const r3 = sinon.spy((state, action) => action.type[2] === 'c' ? {...state, c: 3} : state)

    const initState = {
      featureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      theFeatures: {
        a: {reducer: r1},
        b: {reducer: r2},
        c: {reducer: r3},
        d: {},
        e: {},
      }
    }

    expect(reducer(initState, {type: 'abc'})).to.deep.equal({...initState, a: 1, b: 2, c: 3})
    expect(reducer(initState, {type: '....'})).to.deep.equal(initState)
    expect(r1.calledBefore(r2)).to.be.true
    expect(r2.calledBefore(r3)).to.be.true
  })
  it('supports custom composeReducers', () => {
    const compose = sinon.spy(composeReducers)
    const reducer = featureReducersReducer({composeReducers: compose})

    const r1 = sinon.spy((state, action) => action.type[0] === 'a' ? {...state, a: 1} : state)
    const r2 = sinon.spy((state, action) => action.type[1] === 'b' ? {...state, b: 2} : state)
    const r3 = sinon.spy((state, action) => action.type[2] === 'c' ? {...state, c: 3} : state)

    const initState = {
      featureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      features: {
        a: {reducer: r1},
        b: {reducer: r2},
        c: {reducer: r3},
        d: {},
        e: {},
      }
    }

    expect(reducer(initState, {type: 'abc'})).to.deep.equal({...initState, a: 1, b: 2, c: 3})
    expect(reducer(initState, {type: '....'})).to.deep.equal(initState)
    expect(r1.calledBefore(r2)).to.be.true
    expect(r2.calledBefore(r3)).to.be.true

    expect(compose.called).to.be.true
  })
})