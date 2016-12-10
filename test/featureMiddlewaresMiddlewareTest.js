import featureMiddlewaresMiddleware from '../src/featureMiddlewaresMiddleware'
import {createStore, applyMiddleware} from 'redux'
import {composeMiddleware} from 'mindfront-redux-utils'
import {expect} from 'chai'
import sinon from 'sinon'

describe('featureMiddlewaresMiddleware', () => {
  function createTestStore(initialState, config) {
    return createStore(state => state, initialState, applyMiddleware(
      featureMiddlewaresMiddleware(config)
    ))
  }

  it('calls feature middlewares in order', () => {
    const s1 = sinon.spy(a => a)
    const s2 = sinon.spy(a => a)
    const s3 = sinon.spy(a => a)

    const m1 = store => next => action => next(s1(action))
    const m2 = store => next => action => next(s2(action))
    const m3 = store => next => action => next(s3(action))

    const initState = {
      featureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      features: {
        a: {middleware: m1},
        b: {middleware: m2},
        c: {middleware: m3},
        d: {},
        e: {},
      }
    }

    const store = createTestStore(initState)
    const action = {type: 'test'}
    store.dispatch(action)
    expect(s1.calledWith(action)).to.be.true
    expect(s2.calledWith(action)).to.be.true
    expect(s3.calledWith(action)).to.be.true
    expect(s1.calledBefore(s2)).to.be.true
    expect(s2.calledBefore(s3)).to.be.true

    const state2 = {
      featureStates: {
        a: 'LOADED',
      },
      features: {
        a: {middleware: m1},
        e: {},
      }
    }
    s1.reset()
    s2.reset()
    s3.reset()
    const store2 = createTestStore(state2)
    store2.dispatch(action)
    expect(s1.calledWith(action)).to.be.true
    expect(s2.called).to.be.false
    expect(s3.called).to.be.false

    const state3 = {}
    s1.reset()
    s2.reset()
    s3.reset()
    const store3 = createTestStore(state3)
    store3.dispatch(action)
    expect(s1.called).to.be.faflse
    expect(s2.called).to.be.false
    expect(s3.called).to.be.false

    const state4 = {
      featureStates: {
        a: 'LOADED',
      },
      features: {
        a: {},
      }
    }
    s1.reset()
    s2.reset()
    s3.reset()
    const store4 = createTestStore(state4)
    store4.dispatch(action)
    expect(s1.called).to.be.faflse
    expect(s2.called).to.be.false
    expect(s3.called).to.be.false
  })
  it('supports custom getFeatures', () => {
    const s1 = sinon.spy(a => a)
    const s2 = sinon.spy(a => a)
    const s3 = sinon.spy(a => a)

    const m1 = store => next => action => next(s1(action))
    const m2 = store => next => action => next(s2(action))
    const m3 = store => next => action => next(s3(action))

    const initState = {
      theFeatureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      theFeatures: {
        a: {middleware: m1},
        b: {middleware: m2},
        c: {middleware: m3},
        d: {},
        e: {},
      }
    }

    const store = createTestStore(initState, {
      getFeatures: state => state.theFeatures,
    })
    const action = {type: 'test'}
    store.dispatch(action)
    expect(s1.calledWith(action)).to.be.true
    expect(s2.calledWith(action)).to.be.true
    expect(s3.calledWith(action)).to.be.true
    expect(s1.calledBefore(s2)).to.be.true
    expect(s2.calledBefore(s3)).to.be.true
  })
  it('supports custom composeMiddleware', () => {
    const s1 = sinon.spy(a => a)
    const s2 = sinon.spy(a => a)
    const s3 = sinon.spy(a => a)

    const m1 = store => next => action => next(s1(action))
    const m2 = store => next => action => next(s2(action))
    const m3 = store => next => action => next(s3(action))

    const initState = {
      featureStates: {
        a: 'LOADED',
        b: 'LOADED',
        c: 'LOADED',
      },
      features: {
        a: {middleware: m1},
        b: {middleware: m2},
        c: {middleware: m3},
        d: {},
        e: {},
      }
    }

    const cms = sinon.spy(composeMiddleware)

    const store = createTestStore(initState, {
      composeMiddleware: cms,
    })
    const action = {type: 'test'}
    store.dispatch(action)
    expect(s1.calledWith(action)).to.be.true
    expect(s2.calledWith(action)).to.be.true
    expect(s3.calledWith(action)).to.be.true
    expect(s1.calledBefore(s2)).to.be.true
    expect(s2.calledBefore(s3)).to.be.true
    expect(cms.called).to.be.true
  })
})
