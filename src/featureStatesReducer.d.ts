import type { AnyAction, Reducer } from 'redux'
import type { FeatureStates, CreateReducer } from './index'
export default function featureStatesReducer<
  S extends FeatureStates = FeatureStates,
  A extends AnyAction = AnyAction
>(config?: { createReducer?: CreateReducer<S, A> }): Reducer<S, A>
