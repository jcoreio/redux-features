import type { Reducer } from 'redux'
import type { Features, ComposeReducers } from './index'
export default function featureReducersReducer<S>(config?: {
  getFeatures?: (state: S) => Features<S> | null | undefined
  composeReducers?: ComposeReducers<S>
}): Reducer<S>
