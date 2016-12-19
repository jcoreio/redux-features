# redux-features

[![Build Status](https://travis-ci.org/jcoreio/redux-features.svg?branch=master)](https://travis-ci.org/jcoreio/redux-features)
[![Coverage Status](https://coveralls.io/repos/github/jcoreio/redux-features/badge.svg?branch=master)](https://coveralls.io/github/jcoreio/redux-features?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A feature-oriented programming and code-splitting framework for Redux (rewrite of [`redux-plugins-immutable`](https://github.com/jcoreio/redux-plugins-immutable)).
Asynchronously load Redux reducers and middleware, React Components, react-router routes, etc. using Webpack code splitting.
Compatible with server-side rendering.

## Ecosystem

* [`react-redux-features`](https://github.com/jcoreio/react-redux-features): creates declarative feature loaders that proxy to feature components.
* [`redux-features-hot-loader`](https://github.com/jcoreio/redux-features-hot-loader): webpack hot reloader for features.

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

## Reserved methods

The following (optional) methods are reserved in features:
* `load(store)`: called by `loadFeatureMiddleware` when a `loadFeature` action is dispatched.  Returns a `Promise` that
will resolve to the new content for the feature (which will replace the existing feature in the state).
* `init(store)`: called by `loadFeatureMiddleware` when a feature is added via an `addFeature` action.  This hook is
primarily intended to be used by `redux-features-hot-loader`.

## But Redux state shouldn't contain functions, React components, etc.!!

Yes, I understand.  I thought about ways to store the functions, React components, etc. for features outside of
Redux state, and I came to the conclusion that it's best to just keep them in the Redux state.  Here's why:
* The alternative would be separate store and provider of some sort to pass down features' functions and components
through React context.
* All of the non-serializable feature functions and components are organized in a single subtree of your state that is
easy to strip out before serializing (and I designed this so that it's easy to do that in SSR and then load the features
properly on the client).  That's way simpler than setting up a separate store and provider for feature content.

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

## Server-side rendering

Loading features during SSR, and then again on the client, when bootstrapping, takes a bit of extra effort.  There are
two options:
* Manually dispatch `loadFeature` actions applicable to the requested route.
* Do two-pass rendering:
  * Create the store with a middleware that keeps track of `loadFeature` promises
  * Render the app in your first pass with components that dispatch the applicable `loadFeature` events (e.g.
    `featureLoader`s from `react-redux-features`
  * Wait for the `loadFeature` promises to resolve
  * Render again, which will now include the loaded feature components, and send it to the client

On the client, after you create your store from the initial server-side redux state, dispatch the `loadInitialFeatures`
action, which will load all the features that were loaded on the server side.

### Example

#### reducer.js
```es6
import {composeReducers, featuresReducer, featureStatesReducer, featureReducersReducer} from 'redux-features'

export default composeReducers(
  combineReducers({
    features: featuresReducer(),
    featureStates: featureStatesReducer(),
  }),
  featureReducersReducer()
)
```

#### counterFeature.js
```es6
export default {
  load: (store) => Promise.resolve({
    reducer: (state, action) => action.type === 'INCREMENT' ? {...state, count: (state.count || 0) + 1} : state,
    Counter: connect(({count}) => ({count}))(({count}) => <div>{`Counter: ${count || 0}`}</div>),
  })
}
```

#### Counter.js
```es6
import React from 'react'
import {featureLoader} from 'react-redux-features'

const Counter = featureLoader({
  featureId: 'counter',
  render({featureState, feature, props}) {
    const Comp = feature && feature.Counter
    if (featureState instanceof Error) {
       return <div className="alert alert-danger">Failed to load counter: {featureState.message}</div>
    } else if (!Comp) {
      return <div className="alert alert-info">Loading counter...</div>
    }
    return <Comp {...props} />
  }
})
```

#### serverSideRender.js

```es6
import React from 'react'
import {renderToString} from 'react-dom/server'
import {combineReducers, createStore, applyMiddleware} from 'redux'
import {connect, Provider} from 'react-redux'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware, addFeature, LOAD_FEATURE} from 'redux-features'
import reducer from './reducer'
import counterFeature from './counterFeature'
import Counter from './Counter'

async function serverSideRender(request, response) {
  const featurePromises = []

  const store = createStore(
    reducer,
    applyMiddleware(
      store => next => action => {
        const result = next(action)
        if (action.type === LOAD_FEATURE) featurePromises.push(result)
        return result
      },
      loadFeatureMiddleware(),
      featureMiddlewaresMiddleware(),
    )
  )

  store.dispatch(addFeature('counter', counterFeature))

  const app = (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
  renderToString(app)
  try {
    await Promise.all(featurePromises)
  } catch (error) {
    response.status(500).send(error.stack)
  }

  const body = renderToString(app)

  // get all state except features
  const {features, ...initialState} = store.getState()

  response.status(200).send(`<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript">
      window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
    </script>
    <script src="/client.js">
  </head>
  <body>
    <div id="root">${body}</div>
  </body>
</html>`)
}
```

#### client.js

```es6
import React from 'react'
import {render} from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import reducer from './reducer'
import Counter from './Counter'
import counterFeature from './counterFeature'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware, addFeature, loadInitialFeatures} from 'redux-features'

const store = createStore(
  reducer,
  window.__INITIAL_STATE__,
  applyMiddleware(
    loadFeatureMiddleware(),
    featureMiddlewaresMiddleware()
  )
)
store.dispatch(addFeature(counterFeature))
store.dispatch(loadInitialFeatures())

render(
  <Provider store={store}>
    <Counter />
  </Provider>,
  document.getElementById('root')
)
```
