import type { Features, FeatureStates } from './index'
import type { Dispatch, Middleware } from 'redux'
export default function loadFeatureMiddleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch
>(config?: {
  getFeatures?: (
    state: S
  ) => Features<S, Parameters<D>[0], D> | null | undefined
  getFeatureStates?: (state: S) => FeatureStates | null | undefined
  createMiddleware?: (
    middlewares: Record<string, Middleware<DispatchExt, S, D>>
  ) => Middleware<DispatchExt, S, D>
}): Middleware<DispatchExt, S, D>
