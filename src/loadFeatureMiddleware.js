// @flow

import type {Middleware, Feature, Features, FeatureStates, MiddlewareAPI, Dispatch, FeatureAction} from './index.js.flow'
import {LOAD_FEATURE, installFeature, setFeatureState} from './actions'

export default function loadFeatureMiddleware<S, A: {type: $Subtype<string>}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    getFeatureStates?: (state: S) => ?FeatureStates,
  } = {}
): Middleware<S, A | FeatureAction> {
  const getFeatures = config.getFeatures || ((state: any) => state && state.features)
  const getFeatureStates = config.getFeatureStates || ((state: any) => state && state.featureStates)

  return (store: MiddlewareAPI<S, A | FeatureAction>) => (next: Dispatch<A | FeatureAction>) => (action: any): any => {
    const id = action.meta && action.meta.id
    if (action.type !== LOAD_FEATURE || typeof id !== 'string') return next(action)

    next(action)

    const feature = (getFeatures(store.getState()) || {})[id]
    const featureState = (getFeatureStates(store.getState()) || {})[id]
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
  }
}


