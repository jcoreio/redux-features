/* eslint-env node */

import {createStore, applyMiddleware, combineReducers} from 'redux'
import {createMiddleware} from 'mindfront-redux-utils'
import featuresReducer from '../src/featuresReducer'
import featureStatesReducer from '../src/featureStatesReducer'
import loadFeatureMiddleware from '../src/loadFeatureMiddleware'
import {addFeature, loadFeature, setFeatureState, installFeature, loadInitialFeatures} from '../src/actions'
import {expect, assert} from 'chai'
import sinon from 'sinon'

describe('loadFeatureMiddleware', () => {
  const reducer = sinon.spy((state, action) => state)

  function createTestStore(initialState, config) {
    return createStore(reducer, initialState, applyMiddleware(loadFeatureMiddleware(config)))
  }

  function createFullStore(initialState, config) {
    return createStore(
      combineReducers({
        featureStates: featureStatesReducer(config),
        features: featuresReducer(config),
      }),
      initialState,
      applyMiddleware(loadFeatureMiddleware(config))
    )
  }

  beforeEach(() => reducer.reset())

  function tests(createTestStore) {
    it("calls init on added features", () => {
      const store = createStore(combineReducers({
        featureStates: featureStatesReducer(),
        features: featuresReducer(),
      }), applyMiddleware(loadFeatureMiddleware()))

      const init = sinon.spy()
      const f1 = {init}

      store.dispatch(addFeature('f1', f1))
      expect(init.args[0][0].dispatch).to.be.an.instanceOf(Function)
      expect(init.args[0][0].getState).to.be.an.instanceOf(Function)
      expect(init.args[0][1]).to.equal('f1')
    })
    it("doesn't call init on features that are already added", () => {
      const init = sinon.spy()
      const f1 = {init}

      const store = createStore(combineReducers({
        featureStates: featureStatesReducer(),
        features: featuresReducer(),
      }), {
        featureStates: {
          f1: 'NOT_LOADED',
        },
        features: {
          f1,
        },
      }, applyMiddleware(loadFeatureMiddleware()))

      store.dispatch(addFeature('f1', f1))
      expect(init.called).to.be.false
    })
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
      it("returns a promise that rejects when any feature fails to load", async () => {
        const error = new Error("test!")
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
              load: () => Promise.reject(error)
            },
            f2: {
              load: () => new Promise(resolve => setTimeout(() => resolve({b: 2}), 100))
            },
            f3: {},
          }
        }, applyMiddleware(loadFeatureMiddleware()))
        try {
          await store.dispatch(loadInitialFeatures())
          assert.fail('loadInitialFeatures should have rejected')
        } catch (e) {
          expect(e).to.equal(error)
        }
        expect(store.getState().featureStates).to.deep.equal({
          f1: error,
          f2: 'LOADING',
          f3: 'NOT_LOADED',
        })
      })
    })
    describe('on features with dependencies', () => {
      it("loads dependencies", async() => {
        const loadedDependency = {something: 'cool'}
        const loadedFeature = {hello: 'world'}
        const store = createFullStore({
          featureStates: {
            f1: 'NOT_LOADED',
            f2: 'NOT_LOADED',
          },
          features: {
            f1: {
              load: (store) => Promise.resolve(loadedDependency)
            },
            f2: {
              dependencies: ['f1'],
              load: (store) => Promise.resolve(loadedFeature)
            }
          }
        })
        const result = await store.dispatch(loadFeature('f2'))
        expect(result).to.equal(loadedFeature)
        expect(store.getState()).to.deep.equal({
          featureStates: {
            f1: 'LOADED',
            f2: 'LOADED',
          },
          features: {
            f1: loadedDependency,
            f2: loadedFeature,
          }
        })
      })
      it("rejects if any dependencies fail to load", async () => {
        const loadedFeature = {hello: 'world'}
        const error = new Error("test!")
        const store = createFullStore({
          featureStates: {
            f1: 'NOT_LOADED',
            f2: 'NOT_LOADED',
          },
          features: {
            f1: {
              load: (store) => Promise.reject(error)
            },
            f2: {
              dependencies: ['f1'],
              load: (store) => Promise.resolve(loadedFeature)
            }
          }
        })
        try {
          await store.dispatch(loadFeature('f2'))
          assert.fail('loadFeature should have rejected')
        } catch (e) {
          expect(e).to.equal(error)
        }
        expect(store.getState().featureStates).to.deep.equal({
          f1: error,
          f2: error,
        })
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
