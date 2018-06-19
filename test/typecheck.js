// @flow

import type {Features, FeatureStates, FeatureAction} from '../src/index'
import {
  composeReducers, featuresReducer, featureStatesReducer, featureReducersReducer,
  loadFeatureMiddleware, featureMiddlewaresMiddleware, addFeature,
} from '../src'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import type {Store, Reducer} from 'redux'

type Action = {
  type: string,
  payload?: any,
  meta?: Object,
  error?: boolean,
} | FeatureAction

type State = {
  features: Features<State, Action>,
  featureStates: FeatureStates,
}

const reducer: Reducer<State, Action> = composeReducers(
  combineReducers({
    features: featuresReducer(),
    featureStates: featureStatesReducer(),
  }),
  featureReducersReducer()
)

const store: Store<State, Action> = createStore(
  reducer,
  applyMiddleware(loadFeatureMiddleware(), featureMiddlewaresMiddleware())
)

const feature = {
  reducer: (state: State | void, action: Action) => state,
}
store.dispatch(addFeature('test', feature))
