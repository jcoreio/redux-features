import type { Features, FeatureStates, FeatureAction } from '../src/index'
import {
  composeReducers,
  featuresReducer,
  featureStatesReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
  addFeature,
} from '../src'
import { combineReducers, createStore, applyMiddleware } from 'redux'
import type { Store, Reducer } from 'redux'
type Action =
  | {
      type: string
      payload?: any
      meta?: any
      error?: boolean
    }
  | FeatureAction
type State = {
  features: Features<State>
  featureStates: FeatureStates
}
const reducer: Reducer<State> = composeReducers(
  combineReducers({
    features: featuresReducer(),
    featureStates: featureStatesReducer(),
  }),
  featureReducersReducer()
)
const store: Store<State> = createStore(
  reducer,
  applyMiddleware(loadFeatureMiddleware(), featureMiddlewaresMiddleware())
)
const feature = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reducer: (state: State | undefined, action: Action) => state,
} as const
store.dispatch(addFeature('test', feature))
