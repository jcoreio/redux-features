// @flow

import type {Middleware, Feature, Features, FeatureStates, MiddlewareAPI, Dispatch} from './index.js.flow'
import {LOAD_FEATURE, installFeature, setFeatureState} from './actions'

export default function loadFeatureMiddleware<S, A: {+type?: string, +payload?: Feature<any, any>, +meta?: Object}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    getFeatureStates?: (state: S) => ?FeatureStates,
  } = {}
): Middleware<S, A> {
  const getFeatures = config.getFeatures || ((state: any) => state.features)
  const getFeatureStates = config.getFeatureStates || ((state: any) => state.featureStates)

  return (store: MiddlewareAPI<S, A>) => (next: Dispatch<A>) => (action: A): any => {
    const id = action.meta && action.meta.id
    if (action.type !== LOAD_FEATURE || typeof id !== 'string') return next(action)

    next(action)

    const feature = (getFeatures(store.getState()) || {})[id]
    const featureState = (getFeatureStates(store.getState()) || {})[id]
    if (feature) {
      if (featureState === 'LOADED') return Promise.resolve(feature)
      if (!(feature.load instanceof Function)) return Promise.reject(new Error('missing load method for feature id: ' + id))

      return (
        feature.load(store)
          .catch((error: Error) => {
            store.dispatch((setFeatureState(id, error): any)) // https://github.com/facebook/flow/issues/2993
            throw error
          })
          .then((feature: Feature<S, A>): Feature<S, A> => {
            store.dispatch((installFeature(id, feature): any)) // https://github.com/facebook/flow/issues/2993
            return feature
          })
      )
    }
  }
}


