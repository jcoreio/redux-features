// @flow

import {createSelector} from 'reselect'
import type {Features, Middleware, ComposeMiddleware} from './index.js.flow'

import {defaultComposeMiddleware} from './config'

export default function featureMiddlewaresMiddleware<S, A: {type: $Subtype<string>}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    composeMiddleware?: ComposeMiddleware<S, A>,
  } = {}
): Middleware<S, A> {
  const getFeatures = config.getFeatures || ((state: any) => state.features)
  const composeMiddleware = config.composeMiddleware || defaultComposeMiddleware

  const selectFeatureMiddleware: (state: S) => Middleware<S, A> = createSelector(
    getFeatures,
    (features: ?Features<S, A>): Middleware<S, A> => {
      if (!features) return store => next => next
      const middlewares: Array<Middleware<S, A>> = []
      for (let id in features) {
        const {middleware} = features[id]
        if (middleware instanceof Function) middlewares.push(middleware)
      }
      if (!middlewares.length) return store => next => next
      return composeMiddleware(...middlewares)
    }
  )

  return store => next => action => selectFeatureMiddleware(store.getState())(store)(next)(action)
}
