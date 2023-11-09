import type { Reducer, Middleware } from 'redux'
export declare const defaultCreateReducer: (<S>(
  initialState: S,
  reducers: {
    [actionType: string]: Reducer<S>
  }
) => Reducer<S>) &
  (<S>(reducers: { [actionType: string]: Reducer<S> }) => Reducer<S>)
export declare function defaultComposeReducers<S>(
  ...reducers: Array<Reducer<S>>
): Reducer<S>
export declare function defaultCreateMiddleware(middlewares: {
  [actionType: string]: Middleware
}): Middleware
export declare function defaultComposeMiddleware(
  ...middlewares: Array<Middleware>
): Middleware
