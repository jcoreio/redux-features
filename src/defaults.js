// @flow

import type {Reducer, Middleware, MiddlewareAPI, Dispatch} from './index.js.flow'

export const defaultCreateReducer:
  (<S, A: {type: $Subtype<string>}>(reducers: {[actionType: string]: Reducer<S, A>}) => Reducer<S, A>) |
  (<S, A: {type: $Subtype<string>}>(initialState: S, reducers: {[actionType: string]: Reducer<S, A>}) => Reducer<S, A>)
  = function <S, A: {type: $Subtype<string>}>(): Reducer<S, A> {
  const initialState = arguments[1] ? arguments[0] : undefined
  const reducers = arguments[1] ? arguments[1] : arguments[0]
  return function actionHandlerReducer(state: S, action: A): S {
    if (state === undefined && initialState !== undefined) state = initialState
    const reducer = reducers[action.type]
    return reducer ? reducer(state, action) : state
  }
}

export function defaultComposeReducers<S, A>(...reducers: Array<Reducer<S, A>>): Reducer<S, A> {
  return function composedReducer(state: S, action: A): S {
    return reducers.reduceRight(
      (state, reducer) => reducer(state, action),
      state
    )
  }
}

export function defaultCreateMiddleware<S, A: {type: $Subtype<string>}>(middlewares: {[actionType: string]: Middleware<S, A>}): Middleware<S, A> {
  return (store: MiddlewareAPI<S, A>) => (next: Dispatch<A>) => (action: A) => {
    const middleware = middlewares[action.type]
    if (!middleware) return next(action)
    return middleware(store)(next)(action)
  }
}

export function defaultComposeMiddleware<S, A: {type: $Subtype<string>}>(...middlewares: Array<Middleware<S, A>>): Middleware<S, A> {
  return store => next => middlewares.reduceRight((next, handler) => handler(store)(next), next)
}

