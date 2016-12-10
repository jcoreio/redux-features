// @flow

import type {Middleware, Features, FeatureStates, MiddlewareAPI, Dispatch, FeatureAction} from './index.js.flow'
import {LOAD_FEATURE, installFeature, setFeatureState} from './actions'

export default function loadFeatureSyncMiddleware<S, A: {type: $Subtype<string>}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    getFeatureStates?: (state: S) => ?FeatureStates,
  } = {}
): Middleware<S, A | FeatureAction> {
  const getFeatures = config.getFeatures || ((state: any) => state.features)
  const getFeatureStates = config.getFeatureStates || ((state: any) => state.featureStates)

  return (store: MiddlewareAPI<S, A | FeatureAction>) => (next: Dispatch<A | FeatureAction>) => (action: Object): any => {
    const id = action.meta && action.meta.id
    if (action.type !== LOAD_FEATURE || typeof id !== 'string') return next(action)

    next(action)

    const feature = (getFeatures(store.getState()) || {})[id]
    const featureState = (getFeatureStates(store.getState()) || {})[id]
    if (feature) {
      if (featureState === 'LOADED') return Promise.resolve(feature)
      if (!(feature.loadSync instanceof Function)) {
        throw new Error('missing loadSync method for feature id: ' + id)
      }

      try {
        const loadedFeature = feature.loadSync(store)
        store.dispatch((installFeature(id, loadedFeature): any))
        return loadedFeature
      } catch (error) {
        store.dispatch((setFeatureState(id, error): any))
        throw error
      }
    }
  }
}

