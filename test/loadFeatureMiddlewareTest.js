/* eslint-env node */

import {createStore, applyMiddleware, combineReducers} from 'redux'
import {createMiddleware} from 'mindfront-redux-utils'
import featuresReducer from '../src/featuresReducer'
import featureStatesReducer from '../src/featureStatesReducer'
import loadFeatureMiddleware from '../src/loadFeatureMiddleware'
import {loadFeature, setFeatureState, installFeature, loadInitialFeatures} from '../src/actions'
import {expect} from 'chai'
import sinon from 'sinon'

describe('loadFeatureMiddleware', () => {
  const reducer = sinon.spy((state, action) => state)

  function createTestStore(initialState, config) {
    return createStore(reducer, initialState, applyMiddleware(loadFeatureMiddleware(config)))
  }

  beforeEach(() => reducer.reset())

  function tests(createTestStore) {
    it("returns rejected Promise for missing feature", () => {
      let store = createTestStore()
      return store.dispatch(loadFeature('f1', {}))
        .then(() => {
          throw new Error("Promise should have been rejected")
        })
        .catch(() => {
        })
    })
    it("returns rejected Promise for NOT_LOADED feature without load method", () => {
      let store = createTestStore({
        featureStates: {
          f1: 'NOT_LOADED',
          f2: 'NOT_LOADED',
        },
        features: {
          f1: {},
          f2: {
            load: 'invalid'
          }
        }
      })
      return store.dispatch(loadFeature('f1'))
        .then(() => {
          throw new Error("Promise should have been rejected")
        })
        .catch(() => store.dispatch(loadFeature('f2')))
        .then(() => {
          throw new Error("Promise should have been rejected")
        })
        .catch(() => {
        })
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
        .then(feature => {
          throw new Error('Promise should have been rejected, instead got: ' + JSON.stringify(feature))
        })
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
    describe("on loadInitialFeatures", () => {
      it("dispatches loadFeature action for each LOADED feature", () => {
        let store = createTestStore({
          featureStates: {
            f1: 'LOADED',
            f2: 'LOADED',
            f3: 'NOT_LOADED',
          },
          features: {
            f1: {},
            f2: {},
            f3: {},
          }
        })
        return store.dispatch(loadInitialFeatures())
          .then(() => {
            expect(reducer.calledWith(
              store.getState(),
              loadFeature('f1')
            )).to.be.true
            expect(reducer.calledWith(
              store.getState(),
              loadFeature('f2')
            )).to.be.true
            expect(reducer.calledWith(
              store.getState(),
              loadFeature('f3')
            )).to.be.false
          })
      })
      it("returns a promise that resolves when all features are loaded", () => {
        const store = createStore(combineReducers({
          featureStates: featureStatesReducer(),
          features: featuresReducer(),
        }), {
          featureStates: {
            f1: 'LOADED',
            f2: 'LOADED',
            f3: 'NOT_LOADED',
          },
          features: {
            f1: {
              load: () => new Promise(resolve => setTimeout(() => resolve({a: 1}), 50))
            },
            f2: {
              load: () => new Promise(resolve => setTimeout(() => resolve({b: 2}), 100))
            },
            f3: {},
          }
        }, applyMiddleware(loadFeatureMiddleware()))
        return store.dispatch(loadInitialFeatures())
          .then(() => {
            expect(store.getState()).to.deep.equal({
              featureStates: {
                f1: 'LOADED',
                f2: 'LOADED',
                f3: 'NOT_LOADED',
              },
              features: {
                f1: {a: 1},
                f2: {b: 2},
                f3: {},
              }
            })
          })
      })
      it("returns a promise that rejects when any feature fails to load", () => {

      })
    })
  }
  tests(createTestStore)
  describe('with custom createMiddleware', () => {
    function createTestStore(initialState, config) {
      return createStore(reducer, initialState, applyMiddleware(
        loadFeatureMiddleware({
          ...config,
          createMiddleware,
        })
      ))
    }
    tests(createTestStore)
  })
})
