# redux-features

[![Build Status](https://travis-ci.org/jedwards1211/redux-features.svg?branch=master)](https://travis-ci.org/jedwards1211/redux-features)
[![Coverage Status](https://coveralls.io/repos/github/jedwards1211/redux-features/badge.svg?branch=master)](https://coveralls.io/github/jedwards1211/redux-features?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Quick start

```es6
import {createStore, applyMiddleware, combineReducers} from 'redux'
import {
  featureStatesReducer,
  featuresReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
  composeReducers,
  addFeature,
  loadFeature,
} from 'redux-features'

const reducer = composeReducers(
  combineReducers({
    featureStates: featureStatesReducer,
    features: featuresReducer,
    ...
    // your own app reducers here
  }),
  featureReducersReducer,
)

const store = createStore(reducer, applyMiddleware(
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware
  // more middleware you want here
))

const feature1 = {
  load(store) {
    // load a reducer and merge it into feature1's state
    return (
      System.import('./feature1/reducer')
        .then(reducer => ({...this, reducer})
    )
  }
}

store.dispatch(addFeature('feature1', feature1))

// state now looks like this:
/*
 * {
 *   featureStates: {
 *     feature1: 'NOT_LOADED'
 *   }
 *   features: {
 *     feature1: {
 *       load: load(store)
 *     }
 *   }
 * }
 */

store.dispatch(loadFeature('feature1'))
  .then(() => {
    // feature1's reducer is now active; featureReducersReducers calls it on every action.

    // state now looks like this:
    /*
     * {
     *   featureStates: {
     *     feature1: 'LOADED'
     *   }
     *   features: {
     *     feature1: {
     *       load: load(store),
     *       reducer: feature1Reducer(state, action)
     *     }
     *   }
     * }
     */
  })
```

## Setup

There are 3 things you must hook into your redux store to use `redux-features`:
* `featureStatesReducer` - controls state specifying whether features are loaded or not
* `featuresReducer` - puts the features' configurations into the state
* `loadFeatureMiddleware` - handles `loadFeature` actions by calling a feature's `load` method
  and dispatching `installFeature` when it resolves (or `setFeatureStatus` with an `error` if it rejects).

If you're using `combineReducers`, you can hook `featuresReducer` and `featureStatesReducer` into it with any keys you
want:

```es6
import {combineReducers} from 'redux'
import {featureStatesReducer, featuresReducer} from 'redux-features'

const appReducer = combineReducers({
  ...
  myFeatureStates: featureStatesReducer(),
  myFeatures: featuresReducer(),
})
```

Which would make your state look like
```es6
{
  ...
  myFeatureStates: {
    feature1: 'NOT_LOADED',
    feature2: 'LOADING',
  },
  myFeatures: {
    feature1: {...},
    feature2: {...},
  },
}
```

If you mount the features and their states anywhere other than `state.features` and `state.featureStates`, you have to
tell `loadFeatureMiddleware` how to get them out of the state, like this:

```es6
import {createStore, applyMiddleware} from 'redux'
import {loadFeatureMiddleware} from 'redux-features'
import reducer from './reducer'
import initialState from './initalState'

const store = createStore(reducer, initialState, applyMiddleware(
  loadFeatureMiddleware({
    getFeatureStates: state => state.myFeatureStates,
    getFeatures: state => state.myFeatures,
  })
))
```
