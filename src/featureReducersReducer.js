// @flow

import type {Reducer} from 'redux'
import type {Features, ComposeReducers} from './index.js.flow'
import {createSelector} from 'reselect'

import {defaultComposeReducers} from './defaults'

export default function featureReducersReducer<S, A: {type: $Subtype<string>}>(
  config?: {
    getFeatures?: (state: S) => ?Features<S, A>,
    composeReducers?: ComposeReducers<S, A>,
  } = {}
): Reducer<S, A> {
  const getFeatures = config.getFeatures || (state => state ? (state: any).features : {})
  const composeReducers = config.composeReducers || defaultComposeReducers

  const selectFeatureReducers: (state: S) => Reducer<S, A> = createSelector(
    getFeatures,
    (features: ?Features<S, A>): Reducer<S, A> => {
      if (!features) return state => state
      const reducers: Array<Reducer<S, A>> = []
      for (let id in features) {
        const {reducer} = features[id]
        if (reducer instanceof Function) reducers.push(reducer)
      }
      if (!reducers.length) return state => state
      return composeReducers(...reducers)
    }
  )

  return (state, action) => selectFeatureReducers(state)(state, action)
}
