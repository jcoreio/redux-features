# redux-features

[![Build Status](https://travis-ci.org/jedwards1211/redux-features.svg?branch=master)](https://travis-ci.org/jedwards1211/redux-features)
[![Coverage Status](https://coveralls.io/repos/github/jedwards1211/redux-features/badge.svg?branch=master)](https://coveralls.io/github/jedwards1211/redux-features?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A feature-oriented programming and code-splitting framework for Redux (rewrite of [`redux-plugins-immutable`](https://github.com/jcoreio/redux-plugins-immutable)).
Asynchronously load Redux reducers and middleware, React Components, react-router routes, etc. using Webpack code splitting.

## Ecosystem

Use [`react-redux-features`](https://github.com/jcoreio/react-redux-features) to create declarative feature loaders that proxy to feature components.

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
    featureStates: featureStatesReducer(),
    features: featuresReducer(),
    ...
    // your own app reducers here
  }),
  featureReducersReducer(),
)

const store = createStore(reducer, applyMiddleware(
  featureMiddlewaresMiddleware(),
  loadFeatureMiddleware(),
  // more middleware you want here
))

const counter = {
  load(store) {
    return System.import('./counter/reducer').then(reducer => ({...this, reducer})
  }
}

store.dispatch(addFeature('counter', counter))

// state now looks like this:
/*
 * {
 *   featureStates: {
 *     counter: 'NOT_LOADED'
 *   }
 *   features: {
 *     counter: {
 *       load: load(store)
 *     }
 *   }
 * }
 */
```

Now let's say `./counter/reducer.js` contains this:
```es6
export default function counterReducer(state, action) {
  switch (action.type) {
    case 'COUNTER.INCREMENT': return {...state, counter: (state.counter || 0) + 1}
    case 'COUNTER.DECREMENT': return {...state, counter: (state.counter || 0) - 1}
    default: return state
  }
}
```

Once the `'counter'` feature is loaded, `featureReducersReducer` will call `counterReducer`:
```es6
store.dispatch({type: 'COUNTER.INCREMENT'}) // does nothing yet

store.dispatch(loadFeature('counter'))
  .then(() => {
    // state now looks like this:
    /*
     * {
     *   featureStates: {
     *     counter: 'LOADED'
     *   }
     *   features: {
     *     counter: {
     *       load: load(store),
     *       reducer: counterReducer(state, action)
     *     }
     *   }
     * }
     */

     store.dispatch({type: 'COUNTER.INCREMENT'})
     // state.counter is now 1
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

### featureReducersReducer

This is optional; if any feature has a `reducer` property, then `featureReducersReducer` will call it for each action
dispatched to the store.  It must be composed with your top-level reducer so that it can pass the top-level state to
the feature reducers.  You may use the `composeReducers` function from `redux-features` to do this.  Again, if you
mount the features anywhere other than `state.features`, you have to tell `featureReducersReducer` where to find them:

```es6
import {combineReducers} from 'redux'
import {featureStatesReducer, featuresReducer, featureReducersReducer, composeReducers} from 'redux-features'

const baseReducer = combineReducers({
  ...
  myFeatureStates: featureStatesReducer(),
  myFeatures: featuresReducer(),
})

const appReducer = composeReducers(
  baseReducer,
  featureReducersReducer({getFeatures: state => state.myFeatures})
)
```

### featureMiddlewaresMiddleware

Just like `featureReducersReducer`, if any feature has a `middleware` property, then `featureMiddlewaresMiddleware` will
call it for each action dispatched to the store.  It must be composed with your top-level middleware.  If you mount
the features anywhere other than `state.features`, you have to tell `featureMiddlewaresMiddleware` where to find them:

```es6
import {createStore, applyMiddleware, combineReducers} from 'redux'
import {
  featureStatesReducer,
  featuresReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
} from 'redux-features'

const reducer = combineReducers({
  myFeatureStates: featureStatesReducer(),
  myFeatures: featuresReducer(),
  ...
  // your own app reducers here
})

const store = createStore(reducer, applyMiddleware(
  featureMiddlewaresMiddleware({
    getFeatures: state => state.myFeatures,
  }),
  loadFeatureMiddleware({
    getFeatureStates: state => state.myFeatureStates,
    getFeatures: state => state.myFeatures,
  }),
  // more middleware you want here
))
```

### Using custom `createReducers`, `composeReducers`, `createMiddleware`, and `composeMiddleware`

You can pass in your own implementations of `createReducer`, `composeReducers`, `createMiddleware`, and `composeMiddleware`.  For instance,
you can use the implementations from `mindfront-redux-utils`, which can compose reducers from its `createReducer` and
middleware from its `createMiddleware` more efficiently than a naive implementation, for high-action-throughput apps:

```es6
import {createStore, applyMiddleware, combineReducers} from 'redux'
import {
  featureStatesReducer,
  featuresReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
  addFeature,
  loadFeature,
} from 'redux-features'
import {createReducer, composeReducers, createMiddleware, composeMiddleware} from 'mindfront-redux-utils'

const reducer = composeReducers(
  combineReducers({
    featureStates: featureStatesReducer({createReducer}),
    features: featuresReducer({createReducer}),
    ...
    // your own app reducers here
  }),
  featureReducersReducer({composeReducers}),
)

const store = createStore(reducer, applyMiddleware(
  featureMiddlewaresMiddleware({composeMiddleware}),
  loadFeatureMiddleware({createMiddleware}),
  // more middleware you want here
))
```

