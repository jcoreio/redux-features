import { AnyAction } from 'redux'
import type { Feature, FeatureState, FeatureAction } from './index'
export declare const ACTION_TYPE_PREFIX = '@@redux-features/'
export declare const ADD_FEATURE: '@@redux-features/ADD_FEATURE'
export declare const REPLACE_FEATURE: '@@redux-features/REPLACE_FEATURE'
export declare const LOAD_FEATURE: '@@redux-features/LOAD_FEATURE'
export declare const INSTALL_FEATURE: '@@redux-features/INSTALL_FEATURE'
export declare const SET_FEATURE_STATE: '@@redux-features/SET_FEATURE_STATE'
export declare const LOAD_INITIAL_FEATURES: '@@redux-features/LOAD_INITIAL_FEATURES'
export declare function addFeature<S = any, A extends AnyAction = AnyAction>(
  id: string,
  feature: Feature<S, A>
): FeatureAction
export declare function replaceFeature<
  S = any,
  A extends AnyAction = AnyAction
>(id: string, feature: Feature<S, A>): FeatureAction
export declare function loadFeature(id: string): FeatureAction
export declare function installFeature<
  S = any,
  A extends AnyAction = AnyAction
>(id: string, feature: Feature<S, A>): FeatureAction
export declare function setFeatureState(
  id: string,
  payload: FeatureState
): FeatureAction
export declare function loadInitialFeatures(): FeatureAction
