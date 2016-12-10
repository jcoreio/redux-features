import {createStore, applyMiddleware} from 'redux'
import loadFeatureMiddleware from '../src/loadFeatureMiddleware'
import {loadFeature, setFeatureState, installFeature} from '../src/actions'
import {expect} from 'chai'
import sinon from 'sinon'

describe('loadFeatureMiddleware', () => {
  const reducer = sinon.spy((state, action) => state)

  function createTestStore(initialState, config) {
    return createStore(reducer, initialState, applyMiddleware(loadFeatureMiddleware(config)))
  }

  beforeEach(() => reducer.reset())

  it("returns rejected Promise for missing feature", () => {
    let store = createTestStore()
    return store.dispatch(loadFeature('f1', {}))
      .then(() => { throw new Error("Promise should have been rejected") })
      .catch(() => {})
  })
  it("returns rejected Promise for NOT_LOADED feature without load method", () => {
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
        f2: 'NOT_LOADED',
      },
      features: {
        f1: {
        },
        f2: {
          load: 'invalid'
        }
      }
    })
    return store.dispatch(loadFeature('f1'))
      .then(() => { throw new Error("Promise should have been rejected") })
      .catch(() => store.dispatch(loadFeature('f2')))
      .then(() => { throw new Error("Promise should have been rejected") })
      .catch(() => {})
      .then(() => {
        expect(reducer.calledWith(
          store.getState(),
          setFeatureState('f1', new Error('missing load method for feature id: f1'))
        )).to.be.true
        expect(reducer.calledWith(
          store.getState(),
          setFeatureState('f2', new Error('missing load method for feature id: f2'))
        )).to.be.true
      })
  })
  it("returns Promise that resolves to feature if valid", () => {
    let loadedFeature = {hello: 'world'}
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED'
      },
      features: {
        f1: {
          load: (store) => Promise.resolve(loadedFeature)
        }
      }
    })
    return store.dispatch(loadFeature('f1'))
      .then(feature => {
        expect(feature).to.equal(loadedFeature)
      })
  })
  it("dispatches setFeatureStatus with error and rejects Promise if load() errors", () => {
    let loadError = new Error('this should get deleted')
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
      },
      features: {
        f1: {
          load: (store) => Promise.reject(loadError)
        }
      }
    })
    return store.dispatch(loadFeature('f1'))
      .then(feature => { throw new Error('Promise should have been rejected, instead got: ' + JSON.stringify(feature)) })
      .catch(error => {
        expect(reducer.calledWith(
          store.getState(),
          setFeatureState('f1', loadError)
        )).to.be.true
      })
  })
  it("dispatches installFeature if feature loaded successfully", () => {
    let loadedFeature = {hello: 'world'}
    let store = createTestStore({
      featureStates: {
        f1: 'NOT_LOADED',
      },
      features: {
        f1: {
          load: (store) => Promise.resolve(loadedFeature)
        }
      }
    })
    return store.dispatch(loadFeature('f1'))
      .then(() => {
        expect(reducer.calledWith(
          store.getState(),
          installFeature('f1', loadedFeature)
        )).to.be.true
      })
  })
  it("returns resolved promise with feature if it's already loaded", () => {
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
    return store.dispatch(loadFeature('f1'))
      .then(feature => {
        expect(feature).to.equal(loadedFeature)
      })
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
    return store.dispatch(loadFeature('f1'))
      .then(feature => {
        expect(feature).to.equal(loadedFeature)
      })
  })
})
