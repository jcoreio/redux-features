import type { AnyAction, Reducer } from 'redux'
import type { Features, ComposeReducers } from './index'
export default function featureReducersReducer<
  S = any,
  A extends AnyAction = AnyAction
>(config?: {
  getFeatures?: (state: S) => Features<S, A> | null | undefined
  composeReducers?: ComposeReducers<S, A>
}): Reducer<S, A>
