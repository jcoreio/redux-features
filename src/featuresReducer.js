// @flow

import type {Reducer, Features, FeatureAction, CreateReducer} from './index.js.flow'
import {ADD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE} from './actions'

import {defaultCreateReducer} from './config'

export default function featuresReducer<S, A>(
  config?: {
    createReducer?: CreateReducer<Features<S, A>, FeatureAction>,
  } = {}
): Reducer<Features<S, A>, FeatureAction> {
  const createReducer = config.createReducer || defaultCreateReducer

  function setFeature(state: Features<S, A>, {payload, meta: {id}}: FeatureAction): Features<S, A> {
    return {...state, [id]: payload}
  }

  return createReducer({
    [ADD_FEATURE]: setFeature,
    [INSTALL_FEATURE]: setFeature,
    [REPLACE_FEATURE]: setFeature,
  }, {})
}


