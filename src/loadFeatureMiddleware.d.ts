import type { Features, FeatureStates } from './index'
import type { Middleware } from 'redux'
export default function loadFeatureMiddleware<S>(config?: {
  getFeatures?: (state: S) => Features<S> | null | undefined
  getFeatureStates?: (state: S) => FeatureStates | null | undefined
  createMiddleware?: (middlewares: {
    [actionType: string]: Middleware
  }) => Middleware
}): Middleware
