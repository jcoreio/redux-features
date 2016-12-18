// @flow

import type {Middleware, Feature, Features, FeatureStates, MiddlewareAPI, Dispatch, FeatureAction} from './index.js.flow'
import {ADD_FEATURE, LOAD_FEATURE, installFeature, setFeatureState, LOAD_INITIAL_FEATURES, loadFeature} from './actions'
import {defaultCreateMiddleware} from './defaults'

export default function loadFeatureMiddleware<S, A: {type: $Subtype<string>}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    getFeatureStates?: (state: S) => ?FeatureStates,
    createMiddleware?: (middlewares: {[actionType: string]: Middleware<S, A>}) => Middleware<S, A>,
  } = {}
  // flow-issue
): Middleware<S, A | FeatureAction> {
  const getFeatures = config.getFeatures || ((state: any) => state && state.features)
  const getFeatureStates = config.getFeatureStates || ((state: any) => state && state.featureStates)
  const createMiddleware = config.createMiddleware || defaultCreateMiddleware

  return createMiddleware({
    [ADD_FEATURE]: (store: MiddlewareAPI<S, A | FeatureAction>) => (next: Dispatch<A | FeatureAction>) => (action: any): any => {
      const id = action.meta && action.meta.id
      const priorFeature = (getFeatures(store.getState()) || {})[id]
      const result = next(action)
      const feature = (getFeatures(store.getState()) || {})[id]
      if (!priorFeature && feature && feature.init instanceof Function) feature.init(store)
      return result
    },
    [LOAD_FEATURE]: (store: MiddlewareAPI<S, A | FeatureAction>) => (next: Dispatch<A | FeatureAction>) => (action: any): any => {
      const id = action.meta && action.meta.id
      const featureStates = getFeatureStates(store.getState()) || {}

      next(action)

      const feature = (getFeatures(store.getState()) || {})[id]
      const featureState = featureStates[id]
      if (feature) {
        if (featureState === 'LOADED') return Promise.resolve(feature)
        if (!(feature.load instanceof Function)) {
          const error = new Error('missing load method for feature id: ' + id)
          store.dispatch(setFeatureState(id, error))
          return Promise.reject(error)
        }

        return (
          feature.load(store)
            .catch((error: Error) => {
              store.dispatch(setFeatureState(id, error)) // https://github.com/facebook/flow/issues/2993
              throw error
            })
            .then((feature: Feature<S, A>): Feature<S, A> => {
              store.dispatch(installFeature(id, feature)) // https://github.com/facebook/flow/issues/2993
              return feature
            })
        )
      }
      return Promise.reject(new Error('missing feature for id: ', +id))
    },
    [LOAD_INITIAL_FEATURES]: (store: MiddlewareAPI<S, A | FeatureAction>) => (next: Dispatch<A | FeatureAction>) => (action: any): any => {
      const featureStates = getFeatureStates(store.getState()) || {}

      const initialFeatures = []
      for (let id in featureStates) {
        if (featureStates[id] === 'LOADED') initialFeatures.push(id)
      }

      next(action)
      return Promise.all(initialFeatures.map(id => store.dispatch(loadFeature(id))))
    },
  })
}


