/* @flow */

import featuresReducer from './featuresReducer'
import featureStatesReducer from './featureStatesReducer'
import featureReducersReducer from './featureReducersReducer'
import loadFeatureMiddleware from './loadFeatureMiddleware'
import featureMiddlewaresMiddleware from './featureMiddlewaresMiddleware'
import { defaultComposeReducers } from './defaults'
import {
  ACTION_TYPE_PREFIX,
  ADD_FEATURE,
  LOAD_FEATURE,
  INSTALL_FEATURE,
  REPLACE_FEATURE,
  SET_FEATURE_STATE,
  LOAD_INITIAL_FEATURES,
  addFeature,
  loadFeature,
  installFeature,
  replaceFeature,
  setFeatureState,
  loadInitialFeatures,
} from './actions'

export {
  featuresReducer,
  featureStatesReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
  defaultComposeReducers as composeReducers,
  ACTION_TYPE_PREFIX,
  ADD_FEATURE,
  LOAD_FEATURE,
  INSTALL_FEATURE,
  REPLACE_FEATURE,
  SET_FEATURE_STATE,
  LOAD_INITIAL_FEATURES,
  addFeature,
  loadFeature,
  installFeature,
  replaceFeature,
  setFeatureState,
  loadInitialFeatures,
}

import type { MiddlewareAPI, Reducer, Middleware, ActionCreator } from 'redux'

/*

 S = State
 A = Action

 */

export type ActionCreators<K, A> = { [key: K]: ActionCreator<A> }

export type CreateReducer<S, A> = (<S, A: { type: $Subtype<string> }>(
  initialState: S,
  reducers: { [actionType: string]: Reducer<S, A> }
) => Reducer<S, A>) &
  (<S, A: { type: $Subtype<string> }>(reducers: {
    [actionType: string]: Reducer<S, A>,
  }) => Reducer<S, A>)
export type ComposeReducers<S, A> = (
  ...reducers: Array<Reducer<S, A>>
) => Reducer<S, A>
export type ComposeMiddleware<S, A> = (
  ...middlewares: Array<Middleware<S, A>>
) => Middleware<S, A>

export type FeatureState = 'NOT_LOADED' | 'LOADING' | 'LOADED' | Error
export type FeatureStates = { [featureId: string]: FeatureState }

export type Feature<S, A> = {
  init?: (store: MiddlewareAPI<S, A>) => any,
  load?: (store: MiddlewareAPI<S, A>) => Promise<Feature<S, A>>,
  dependencies?: Array<string>,
  middleware?: Middleware<S, A>,
  reducer?: Reducer<S, A>,
}
export type Features<S, A> = { [featureId: string]: Feature<S, A> }

export type FeatureAction = {
  type: string,
  payload?: any,
  meta?: { id: string },
}
