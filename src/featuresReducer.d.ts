import type { Reducer } from 'redux'
import type { Features, CreateReducer } from './index'
export default function featuresReducer<S>(config?: {
  createReducer?: CreateReducer<Features<S>>
}): Reducer<Features<S>>
