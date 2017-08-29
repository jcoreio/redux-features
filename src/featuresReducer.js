// @flow

import type {Reducer} from 'redux'
import type {Features, FeatureAction, CreateReducer} from './index.js.flow'
import {ADD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE} from './actions'

import {defaultCreateReducer} from './defaults'

export default function featuresReducer<S, A>(
  config?: {
    createReducer?: CreateReducer<Features<S, A>, FeatureAction>,
  } = {}
): Reducer<Features<S, A>, FeatureAction> {
  const createReducer = config.createReducer || defaultCreateReducer

  return createReducer({}, {
    [ADD_FEATURE]: (state, {payload, meta: {id}}) => state[id] ? state : {...state, [id]: payload},
    [INSTALL_FEATURE]: (state, {payload, meta: {id}}) => ({...state, [id]: payload}),
    [REPLACE_FEATURE]: (state, {payload, meta: {id}}) => state[id] ? {...state, [id]: payload} : state,
  })
}


