import { AnyAction } from 'redux'
import type { Feature, FeatureState } from './index'
export declare const ACTION_TYPE_PREFIX = '@@redux-features/'
export declare const ADD_FEATURE: '@@redux-features/ADD_FEATURE'
export declare const REPLACE_FEATURE: '@@redux-features/REPLACE_FEATURE'
export declare const LOAD_FEATURE: '@@redux-features/LOAD_FEATURE'
export declare const INSTALL_FEATURE: '@@redux-features/INSTALL_FEATURE'
export declare const SET_FEATURE_STATE: '@@redux-features/SET_FEATURE_STATE'
export declare const LOAD_INITIAL_FEATURES: '@@redux-features/LOAD_INITIAL_FEATURES'

export type AddFeatureAction<S = any, A extends AnyAction = AnyAction> = {
  type: typeof ADD_FEATURE
  payload: Feature<S, A>
  meta: { id: string }
}
export declare function addFeature<S = any, A extends AnyAction = AnyAction>(
  id: string,
  feature: Feature<S, A>
): AddFeatureAction<S, A>

export type ReplaceFeatureAction<S = any, A extends AnyAction = AnyAction> = {
  type: typeof REPLACE_FEATURE
  feature: Feature<S, A>
  meta: { id: string }
}
export declare function replaceFeature<
  S = any,
  A extends AnyAction = AnyAction
>(id: string, feature: Feature<S, A>): ReplaceFeatureAction

export type LoadFeatureAction = {
  type: typeof LOAD_FEATURE
  meta: { id: string }
}
export declare function loadFeature(id: string): LoadFeatureAction

export type InstallFeatureAction<S = any, A extends AnyAction = AnyAction> = {
  type: typeof INSTALL_FEATURE
  feature: Feature<S, A>
  meta: { id: string }
}
export declare function installFeature<
  S = any,
  A extends AnyAction = AnyAction
>(id: string, feature: Feature<S, A>): InstallFeatureAction<S, A>

export type SetFeatureStateAction = {
  type: typeof SET_FEATURE_STATE
  payload: FeatureState
}
export declare function setFeatureState(
  id: string,
  payload: FeatureState
): SetFeatureStateAction

export type LoadInitialFeaturesAction = {
  type: typeof LOAD_INITIAL_FEATURES
}
export declare function loadInitialFeatures(): LoadInitialFeaturesAction

export type FeatureAction<S = any, A extends AnyAction = AnyAction> =
  | AddFeatureAction<S, A>
  | ReplaceFeatureAction<S, A>
  | LoadFeatureAction
  | InstallFeatureAction<S, A>
  | SetFeatureStateAction
  | LoadInitialFeaturesAction
