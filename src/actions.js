/* @flow */

import type {Feature, FeatureState, FeatureAction} from './index.js.flow'

export const ACTION_TYPE_PREFIX = 'REDUX_FEATURES.'
export const ADD_FEATURE = ACTION_TYPE_PREFIX + 'ADD_FEATURE'
export const REPLACE_FEATURE = ACTION_TYPE_PREFIX + 'REPLACE_FEATURE'
export const LOAD_FEATURE = ACTION_TYPE_PREFIX + 'LOAD_FEATURE'
export const INSTALL_FEATURE = ACTION_TYPE_PREFIX + 'INSTALL_FEATURE'
export const SET_FEATURE_STATE = ACTION_TYPE_PREFIX + 'SET_FEATURE_STATE'
export const LOAD_INITIAL_FEATURES = ACTION_TYPE_PREFIX + 'LOAD_INITIAL_FEATURES'

export function addFeature<S, A>(id: string, feature: Feature<S, A>): FeatureAction {
  return {
    type: ADD_FEATURE,
    payload: feature,
    meta: {id}
  }
}

export function replaceFeature<S, A>(id: string, feature: Feature<S, A>): FeatureAction {
  return {
    type: REPLACE_FEATURE,
    payload: feature,
    meta: {id}
  }
}

export function loadFeature(id: string): FeatureAction {
  return {
    type: LOAD_FEATURE,
    meta: {id}
  }
}

export function installFeature<S, A>(id: string, feature: Feature<S, A>): FeatureAction {
  return {
    type: INSTALL_FEATURE,
    payload: feature,
    meta: {id}
  }
}

export function setFeatureState(id: string, payload: FeatureState): FeatureAction {
  return {
    type: SET_FEATURE_STATE,
    payload,
    meta: {id}
  }
}

export function loadInitialFeatures(): FeatureAction {
  return {
    type: LOAD_INITIAL_FEATURES
  }
}
