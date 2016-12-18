// @flow

import {ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE, LOAD_INITIAL_FEATURES} from './actions'
import mapValues from 'lodash.mapvalues'
import type {Reducer, FeatureStates, FeatureAction, CreateReducer} from './index.js.flow'

import {defaultCreateReducer} from './defaults'

export default function featureStatesReducer(
  config?: {
    createReducer?: CreateReducer<FeatureStates, FeatureAction>,
  } = {}
): Reducer<FeatureStates, FeatureAction> {
  const createReducer = config.createReducer || defaultCreateReducer
  return createReducer({}, {
    [ADD_FEATURE]: (state, {meta: {id}}) => (state[id] ? state : {...state, [id]: 'NOT_LOADED'}),
    [LOAD_FEATURE]: (state, {meta: {id}}) => (state[id] && state[id] !== 'LOADED' ? {...state, [id]: 'LOADING'} : state),
    [INSTALL_FEATURE]: (state, {meta: {id}}) => (state[id] ? {...state, [id]: 'LOADED'} : state),
    [REPLACE_FEATURE]: (state, {meta: {id}}) => state[id] ? {...state, [id]: 'NOT_LOADED'} : state,
    [SET_FEATURE_STATE]: (state, {payload, meta: {id}}) => (state[id] ? {...state, [id]: payload} : state),
    [LOAD_INITIAL_FEATURES]: state => mapValues(state, fs => fs === 'LOADED' ? 'LOADING' : fs)
  })
}


