import type { AnyAction, Dispatch, Reducer } from 'redux'
import type { Features, CreateReducer } from './index'
export default function featuresReducer<
  S = any,
  A extends AnyAction = AnyAction,
  D extends Dispatch = Dispatch<A>
>(config?: {
  createReducer?: CreateReducer<Features<S, A>>
}): Reducer<Features<S, A, D>>
