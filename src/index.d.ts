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
export type ActionCreators<K extends string | number | symbol, A> = Partial<
  Record<K, ActionCreator<A>>
>
export interface CreateReducer<S> {
  (
    initialState: S,
    reducers: {
      [actionType: string]: Reducer<S>
    }
  ): Reducer<S>
  (reducers: { [actionType: string]: Reducer<S> }): Reducer<S>
}
export type ComposeReducers<S> = (...reducers: Array<Reducer<S>>) => Reducer<S>
export type ComposeMiddleware = (
  ...middlewares: Array<Middleware>
) => Middleware
export type FeatureState = 'NOT_LOADED' | 'LOADING' | 'LOADED' | Error
export type FeatureStates = {
  [featureId: string]: FeatureState
}
export type Feature<S> = {
  init?: (store: MiddlewareAPI<S>) => any
  load?: (store: MiddlewareAPI<S>) => Promise<Feature<S>>
  dependencies?: Array<string>
  middleware?: Middleware
  reducer?: Reducer<S>
}
export type Features<S> = {
  [featureId: string]: Feature<S>
}
export type FeatureAction = {
  type: string
  payload?: any
  meta?: {
    id: string
  }
}
