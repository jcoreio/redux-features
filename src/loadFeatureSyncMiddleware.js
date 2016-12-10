// @flow

import type {Middleware, Feature, Features, FeatureStates, MiddlewareAPI, Dispatch} from './index.js.flow'
import {LOAD_FEATURE, installFeature, setFeatureState} from './actions'

export default function loadFeatureSyncMiddleware<S, A: {+type?: string, +payload?: Feature<any, any>, +meta?: Object}>(
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

