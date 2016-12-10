// @flow

import {ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE} from './actions'
import type {Reducer, FeatureStates, FeatureAction, CreateReducer} from './index.js.flow'

import {defaultCreateReducer} from './config'

export default function featureStatesReducer(
  config?: {
    createReducer?: CreateReducer<FeatureStates, FeatureAction>,
  } = {}
): Reducer<FeatureStates, FeatureAction> {
  const createReducer = config.createReducer || defaultCreateReducer
  return createReducer({
    [ADD_FEATURE]: (state, {meta: {id}}) => ({...state, [id]: 'NOT_LOADED'}),
    [LOAD_FEATURE]: (state, {meta: {id}}) => ({...state, [id]: 'LOADING'}),
    [INSTALL_FEATURE]: (state, {meta: {id}}) => ({...state, [id]: 'LOADED'}),
    [REPLACE_FEATURE]: state => state,
    [SET_FEATURE_STATE]: (state, {payload, meta: {id}}) => ({...state, [id]: payload}),
  }, {})
}


