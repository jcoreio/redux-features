import type { Reducer, Middleware, AnyAction, Dispatch } from 'redux'
export declare const defaultCreateReducer: {
  <S = any, A extends AnyAction = AnyAction>(
    initialState: S,
    reducers: Record<string, Reducer<S, A>>
  ): Reducer<S, A>
  <S = any, A extends AnyAction = AnyAction>(
    reducers: Record<string, Reducer<S, A>>
  ): Reducer<S, A>
}
export declare function defaultComposeReducers<
  S = any,
  A extends AnyAction = AnyAction
>(...reducers: Array<Reducer<S, A>>): Reducer<S, A>
export declare function defaultCreateMiddleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch
>(
  middlewares: Record<string, Middleware<DispatchExt, S, D>>
): Middleware<DispatchExt, S, D>
export declare function defaultComposeMiddleware<
  DispatchExt = {},
  S = any,
  D extends Dispatch = Dispatch
>(
  ...middlewares: Array<Middleware<DispatchExt, S, D>>
): Middleware<DispatchExt, S, D>
