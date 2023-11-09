import type { Reducer } from 'redux'
import type { FeatureStates, CreateReducer } from './index'
export default function featureStatesReducer(config?: {
  createReducer?: CreateReducer<FeatureStates>
}): Reducer<FeatureStates>
