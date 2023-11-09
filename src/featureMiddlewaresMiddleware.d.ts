import type { Dispatch, Middleware } from 'redux'
import type { Features, ComposeMiddleware } from './index'
export default function featureMiddlewaresMiddleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch
>(config?: {
  getFeatures?: (state: S) => Features<S, Parameters<D>[0]> | null | undefined
  composeMiddleware?: ComposeMiddleware<DispatchExt, S, D>
}): Middleware<DispatchExt, S, D>
