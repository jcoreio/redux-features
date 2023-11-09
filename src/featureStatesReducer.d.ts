import type { Reducer } from 'redux'
import type { FeatureStates, CreateReducer, FeatureAction } from './index'
export default function featureStatesReducer<
  S extends FeatureStates = FeatureStates,
  A extends FeatureAction = FeatureAction
>(config?: { createReducer?: CreateReducer<S, A> }): Reducer<S, A>
