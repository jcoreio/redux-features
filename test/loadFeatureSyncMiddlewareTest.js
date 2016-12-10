import {createStore, applyMiddleware} from 'redux'
import loadFeatureSyncMiddleware from '../src/loadFeatureSyncMiddleware'
import {loadFeature, setFeatureState, installFeature} from '../src/actions'
import {expect} from 'chai'
import sinon from 'sinon'

describe('loadFeatureSyncMiddleware', () => {
  const reducer = sinon.spy((state, action) => state)

  function createTestStore(initialState, config) {
    return createStore(reducer, initialState, applyMiddleware(loadFeatureSyncMiddleware(config)))
  }

  beforeEach(() => reducer.reset())

  it("throws error for missing feature", () => {
    let store = createTestStore()
    expect(() => store.dispatch(loadFeature('f1', {}))).to.throw(Error)
  })
  it("throws error for NOT_LOADED feature without loadSync method", () => {
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
        f2: 'NOT_LOADED',
      },
      features: {
        f1: {
        },
        f2: {
          loadSync: 'invalid'
        }
      }
    })
    expect(() => store.dispatch(loadFeature('f1'))).to.throw(Error)
    expect(() => store.dispatch(loadFeature('f2'))).to.throw(Error)
    expect(reducer.calledWith(
      store.getState(),
      setFeatureState('f1', new Error('missing loadSync method for feature id: f1'))
    )).to.be.true
    expect(reducer.calledWith(
      store.getState(),
      setFeatureState('f2', new Error('missing loadSync method for feature id: f2'))
    )).to.be.true
  })
  it("returns feature if valid", () => {
    let loadedFeature = {hello: 'world'}
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED'
      },
      features: {
        f1: {
          loadSync: (store) => loadedFeature
        }
      }
    })
    expect(store.dispatch(loadFeature('f1'))).to.equal(loadedFeature)
  })
  it("dispatches setFeatureStatus with error and throws error if loadSync() errors", () => {
    let loadError = new Error('this should get deleted')
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
      },
      features: {
        f1: {
          loadSync: (store) => { throw loadError }
        }
      }
    })
    expect(() => store.dispatch(loadFeature('f1'))).to.throw(Error)
    expect(reducer.calledWith(store.getState(), setFeatureState('f1', loadError))).to.be.true
  })
  it("dispatches installFeature if feature loaded successfully", () => {
    let loadedFeature = {hello: 'world'}
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
      },
      features: {
        f1: {
          loadSync: (store) => loadedFeature
        }
      }
    })
    store.dispatch(loadFeature('f1'))
    expect(reducer.calledWith(store.getState(), installFeature('f1', loadedFeature))).to.be.true
  })
  it("returns feature if it's already loaded", () => {
    let loadedFeature = {
      hello: 'world'
    }
    let store = createTestStore({
      featureStates: {
        f1: 'LOADED'
      },
      features: {
        f1: loadedFeature
      }
    })
    expect(store.dispatch(loadFeature('f1'))).to.equal(loadedFeature)
  })
  it("supports custom getFeature and getFeatureStates", () => {
    let loadedFeature = {
      hello: 'world'
    }
    let store = createTestStore({
      featuresStates: {
        f1: 'NOT_LOADED'
      },
      features: {
        f1: {}
      },
      sillyFeatureStates: {
        f1: 'LOADED'
      },
      sillyFeatures: {
        f1: loadedFeature
      }
    }, {
      getFeatureStates: state => state.sillyFeatureStates,
      getFeatures: state => state.sillyFeatures,
    })
    expect(store.dispatch(loadFeature('f1'))).to.equal(loadedFeature)
  })
})
