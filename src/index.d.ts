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
import type {
  MiddlewareAPI,
  Reducer,
  Middleware,
  AnyAction,
  Dispatch,
} from 'redux'

export interface CreateReducer<S, A extends AnyAction = AnyAction> {
  (initialState: S, reducers: Record<A['type'], Reducer<S, A>>): Reducer<S>
  (reducers: Record<A['type'], Reducer<S, A>>): Reducer<S>
}
export type ComposeReducers<S, A extends AnyAction = AnyAction> = (
  ...reducers: Array<Reducer<S, A>>
) => Reducer<S, A>
export type ComposeMiddleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch
> = (
  ...middlewares: Array<Middleware<DispatchExt, S, D>>
) => Middleware<DispatchExt, S, D>
export type FeatureState = 'NOT_LOADED' | 'LOADING' | 'LOADED' | Error
export type FeatureStates = Record<string, FeatureState>
export type Feature<
  S = any,
  A extends AnyAction = AnyAction,
  D extends Dispatch = Dispatch<A>
> = {
  init?: (store: MiddlewareAPI<D, S>) => any
  load?: (store: MiddlewareAPI<D, S>) => Promise<Feature<S, A>>
  dependencies?: Array<string>
  middleware?: Middleware<any, S, D>
  reducer?: Reducer<S, A>
}
export type Features<
  S,
  A extends AnyAction = AnyAction,
  D extends Dispatch = Dispatch<A>
> = Record<string, Feature<S, A, D>>

export type FeatureAction = {
  type: string
  payload?: any
  meta?: {
    id: string
  }
}
