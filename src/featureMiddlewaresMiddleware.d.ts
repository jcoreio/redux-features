import type { Middleware } from 'redux'
import type { Features, ComposeMiddleware } from './index'
export default function featureMiddlewaresMiddleware<S>(config?: {
  getFeatures?: (state: S) => Features<S> | null | undefined
  composeMiddleware?: ComposeMiddleware
}): Middleware
