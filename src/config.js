// @flow

import type {Reducer, Middleware} from './index.js.flow'

export function defaultCreateReducer<S, A: $Subtype<{type: string}>>(reducers: {[actionType: string]: Reducer<S, A>}, initialState?: S): Reducer<S, A> {
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

export function defaultComposeMiddleware<S, A>(...middlewares: Array<Middleware<S, A>>): Middleware<S, A> {
  return store => next => middlewares.reduceRight((next, handler) => handler(store)(next), next)
}


