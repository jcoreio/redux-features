# redux-features

<<<<<<< HEAD
[![npm](https://badge.fury.io/js/redux-features.svg)](https://badge.fury.io/js/redux-features)
[![Build Status](https://travis-ci.org/jcoreio/redux-features.svg?branch=master)](https://travis-ci.org/jcoreio/redux-features)
[![Coverage Status](https://coveralls.io/repos/github/jcoreio/redux-features/badge.svg?branch=master)](https://coveralls.io/github/jcoreio/redux-features?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A feature-oriented programming and code-splitting framework for Redux (rewrite of [`redux-plugins-immutable`](https://github.com/jcoreio/redux-plugins-immutable)).
Asynchronously and atomically load features containing Redux reducers and middleware, React Components, react-router
routes, etc. using Webpack code splitting. Supports server-side rendering.

## Huh?

When a web app gets big enough, initial page load will be too slow unless you split your code into bundles and avoid loading various features until they're needed. For instance, in a React/Redux app, you may have a `UserProfileView` and `userProfileReducer` that you don't want to load until the user visits your `/user/profile` route.

Webpack provides a foundation for this; you can `System.import` those modules when needed and Webpack will put them in a separate code bundle. And `react-router` versions 2 and 3 support `getComponent` hooks on routes in which you can `System.import` the component to render.

But these are bare-bones tools: they don't automatically show any kind of spinner and tell the user what's happening while a bundle is loading, and more importantly, they don't automatically show the user an error if it fails to load. Also, if you want to load reducers or redux middleware from a separate bundle, you need some way to install them in your redux store once they've loaded. None of these are incredibly difficult problems, and you may have basic solutions to them, but you may not have time to design a systematic, well-organized, DRY solution.

This is where `redux-features` comes in! It allows you to define features, each of which may contain a reducer, middleware, React components, or anything else you want. All you have to do is dispatch a `loadFeature` action, and it takes care of loading them and hooking in your reducer and middleware when it's finished. It stores their loading status and load errors (if any) in Redux state, which you can then connect into a component and display to the user. Together with `react-redux-features`, you can create a component with just a few lines of code that automatically starts loading a feature when it mounts, displays its loading or error status to the user, and renders a React component from the feature once it's loaded.

`redux-features` is also a great plugin framework for your app. A third-party developer can write a feature, following the contract of this package, and by simply adding the feature definition via `redux-features`, it can extend or modify your app's behavior.

## Ecosystem

* [`react-redux-features`](https://github.com/jcoreio/react-redux-features): creates declarative feature loaders that proxy to feature components.
* [`redux-features-hot-loader`](https://github.com/jcoreio/redux-features-hot-loader): webpack hot reloader for features.

## TOC
* [Overview](#overview)
  + [But Redux state shouldn't contain functions, React components, etc.!!](#but-redux-state-shouldnt-contain-functions-react-components-etc)
  + [Feature lifecycle](#feature-lifecycle)
  + [Feature API](#feature-api)
* [Quick start](#quick-start)
  + [Creating the redux store](#creating-the-redux-store)
  + [Adding a feature](#adding-a-feature)
  + [Loading the feature](#loading-the-feature)
* [Custom start](#custom-start)
  + [`featuresReducer` and `featureStatesReducer`](#featuresreducer-and-featurestatesreducer)
  + [`loadFeatureMiddleware`](#loadfeaturemiddleware)
  + [featureReducersReducer](#featurereducersreducer)
  + [featureMiddlewaresMiddleware](#featuremiddlewaresmiddleware)
  + [Using custom `createReducers`, `composeReducers`, `createMiddleware`, and `composeMiddleware`](#using-custom-createreducers-composereducers-createmiddleware-and-composemiddleware)
* [Server-side rendering](#server-side-rendering)
  + [One-pass rendering example](#one-pass-rendering-example)
  + [Two-pass rendering example](#two-pass-rendering-example)
    - [reducer.js](#reducerjs)
    - [counterFeature.js](#counterfeaturejs)
    - [counterFeatureImpl.js](#counterfeatureimpljs)
    - [Counter.js](#counterjs)
    - [serverSideRender.js](#serversiderenderjs)
    - [client.js](#clientjs)

## Overview

Each feature is an object you put into Redux state that groups together everything needed for a feature to function.
Typically this will include one ore more React components, a `reducer`, and maybe even `middleware`.  By grouping these
together and atomically adding them to the redux state, you can atomically activate entire parts of your application.

When you combine this with Webpack code splitting, you get a nice, clean way to dynamically load application features
when they are needed, for instance when the user visits a certain route.

This can also be a great foundation for people to develop plugins for your app.

### But Redux state shouldn't contain functions, React components, etc.!!

People have good reasons for advocating this, primarily because you can't serialize functions or React components and
send them over the wire.  But that doesn't mean you can't send everything else, and reconstruct the features from it.

For awhile, I thought I should store the functions, React components, etc. for features outside of Redux state,
but I came to the conclusion that it's best to keep them in the Redux state.  Here's why:

* The alternative would be a separate store and provider of some sort to pass down features' functions and components
through React context, which would be very similar to the Redux store and provider in form.
* All of the non-serializable feature functions and components are organized in a single subtree of your state that is
easy to strip out before serializing.
* The client can reconstruct the same state as the server by adding all of the same features, then loading all of the
features marked as loaded in the serialized state from the server.

### Feature lifecycle

`redux-features` keeps track of the state of each feature in a separate subtree from the features themselves.  Here is
what the feature lifecycle looks like:

* You dispatch `addFeature(...)`
* The feature's state is set to `NOT_LOADED`. `redux-features` middleware calls its `init` method, if it has one.
* You dispatch `loadFeature(...)`
* The feature's state is set to `LOADING`. `redux-features` middleware calls its `load` method, if it has one.
* The promise returned by `load` resolves to the full feature, which `redux-features` middleware dispatches in an
`installFeature(...)` action.
* The feature's state is set to `LOADED`.
* Or the promise returned by `load` rejects, in which case `redux-features` middleware dispatches a
`setFeatureStatus(...)` action with the rejection reason.
* The feature's state is set to the rejection reason.

If you add a feature with a `reducer`, its `reducer` will be active, even if its state is `NOT_LOADED` -- whatever
is in the redux state is active.  Indeed, you may sometimes want to add a feature without a `load` method at all.
You only need to load a feature if you want to fetch code for it asynchronously or perform some other long-running
initialization in the background.

### Feature API

The following optional properties on features are handled by `redux-features`.  However, you may add any other
properties you want.
* `reducer: (state, action) => state`: a reducer to apply to the top-level redux state for each action
* `middleware: store => next => action => any`: middleware to apply for each action
* `init: (store) => any`: called when the feature is added by dispatching an `addFeature` action
* `load: (store) => Promise<Feature>`: called when you dispatch a `loadFeature` action for the feature.  It should
  return a promise that will resolve to the full feature after loading.  The full feature **will replace
  the current feature in the redux state**, so initial properties of the feature will be blown away unless you merge
  them into the full feature yourself.
* `dependencies: Array<string>`: an array of feature ids to load when this feature is loaded.  All dependencies will be
  loaded in parallel with this feature, so they may not be available during the `load` method.  Circular feature
  dependencies are not supported, and the behavior is undefined.  As an alternative to `dependencies`, you can load
  other features (by dispatching `loadFeature` actions) in your feature's `load` method, in which case it's easy to
  wait for those features to load and do something with them before resolving your feature's `load` promise.

## Quick start

### Creating the redux store
```js
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

```

### Adding a feature
```js
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

### Loading the feature

Now let's say `./counter/reducer.js` contains this:
```js
export default function counterReducer(state, action) {
  switch (action.type) {
    case 'COUNTER.INCREMENT': return {...state, counter: (state.counter || 0) + 1}
    case 'COUNTER.DECREMENT': return {...state, counter: (state.counter || 0) - 1}
    default: return state
  }
}
```

Once the `'counter'` feature is loaded, `featureReducersReducer` will call `counterReducer`:
```js
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

## Custom start

You may be setting up your reducer and middleware in a different way than in the examples above; you may be using a
different type for your state, like an Immutable.js Map; or you may want to mount the features and feature states at
non-default locations.  To support that, `redux-features` exports a modular collection of reducers and middleware
you can hook into your app however you need:
* `featuresReducer` - puts the features into the state
* `featureStatesReducer` - controls state specifying whether features are loaded or not
* `featureReducersReducer` - calls features' reducers
* `loadFeatureMiddleware` - handles `loadFeature` actions by calling a feature's `load` method
  and dispatching `installFeature` when it resolves (or `setFeatureStatus` with an `error` if it rejects).
* `featureMiddlewaresMiddleware` - calls features' middleware

Technically you could use only `featuresReducer` if all you want to do is add features that provide React components
to your app at startup, and not do any dynamic loading.

If you want to dynamically load features, you'll need to use `featureStatesReducer` and `loadFeatureMiddleware`.
And if you want to support reducers or middleware in features, you'll need to use `featureReducersReducer` and
`featureMiddlewaresMiddleware`, respectively.

### `featuresReducer` and `featureStatesReducer`

If you're using `combineReducers`, you can hook `featuresReducer` and `featureStatesReducer` into it with any keys you
want:

```js
import {combineReducers} from 'redux'
import {featureStatesReducer, featuresReducer} from 'redux-features'

const appReducer = combineReducers({
  ...
  myFeatureStates: featureStatesReducer(),
  myFeatures: featuresReducer(),
})
```

Which would make your state look like
```js
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

However, you can hook in `featuresReducer` and `featureStatesReducer` however you want, so long as you call them with
the features subtree and feature states subtree, respectively.

### `loadFeatureMiddleware`

If you mount the features and their states anywhere other than `state.features` and `state.featureStates`, you have to
tell `loadFeatureMiddleware` how to get them out of the state, like this:

```js
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

### `featureReducersReducer`

If any feature has a `reducer` property, then `featureReducersReducer` will call it for each action
dispatched to the store.  It must be composed with your top-level reducer so that it can pass the top-level state to
the feature reducers.  You may use the `composeReducers` function from `redux-features` to do this.  Again, if you
mount the features anywhere other than `state.features`, you have to tell `featureReducersReducer` where to find them:

```js
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

### `featureMiddlewaresMiddleware`

Just like `featureReducersReducer`, if any feature has a `middleware` property, then `featureMiddlewaresMiddleware` will
call it for each action dispatched to the store.  If you mount the features anywhere other than `state.features`, you
have to tell `featureMiddlewaresMiddleware` where to find them:

```js
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

You can pass in your own implementations of `createReducer`, `composeReducers`, `createMiddleware`, and
`composeMiddleware`.  For instance, you can use the implementations from `mindfront-redux-utils`, which can compose
reducers from its `createReducer` and middleware from its `createMiddleware` more efficiently than a naive
implementation, for high-action-throughput apps:

```js
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
various options:
* One-pass rendering:
  * Manually dispatch `loadFeature` actions applicable to the requested route.
  * Dispatch `loadFeature` actions in `react-router` v2/v3 hooks like `getComponent`, `getIndexRoute`, etc.
* Two-pass rendering:
  * Create the store with a middleware that keeps track of `loadFeature` promises
  * Render the app in your first pass with components that dispatch the applicable `loadFeature` events (e.g.
    `featureLoader`s from `react-redux-features`
  * Wait for the `loadFeature` promises to resolve
  * Render again, which will now include the loaded feature components, and send it to the client

On the client, after you create your store from the initial server-side redux state, dispatch the `loadInitialFeatures`
action, which will load all the features that were loaded on the server side.  Once it resolves, you are ready to
mount your app.

### One-pass rendering example

TODO

### Two-pass rendering example

(using Webpack 1x)

#### reducer.js
```js
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
```js
export default {
  load: (store) => new Promise(resolve =>
    require.ensure(['./counterFeatureImpl'], require => require('./counterFeatureImpl').default)
  )
}
```

#### counterFeatureImpl.js
```js
// polyfill require.ensure for the server side
if (__SERVER__) require.ensure = (modules, callback) => callback(require)

export default {
  reducer: (state, action) => action.type === 'INCREMENT' ? {...state, count: (state.count || 0) + 1} : state,
  Counter: connect(({count}) => ({count}))(({count}) => <div>{`Counter: ${count || 0}`}</div>),
}
```

#### Counter.js
```js
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

```js
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

```js
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
  .then(() => render(
    <Provider store={store}>
      <Counter />
    </Provider>,
    document.getElementById('root')
  ))
  .catch(error => render(
    <div className="alert alert-danger">
      Failed to load some features: {error.message}
    </div>,
    document.getElementById('root')
  ))
```
=======
[![Build Status](https://travis-ci.org/jedwards1211/es2015-library-skeleton.svg?branch=master)](https://travis-ci.org/jedwards1211/es2015-library-skeleton)
[![Coverage Status](https://codecov.io/gh/jedwards1211/es2015-library-skeleton/branch/master/graph/badge.svg)](https://codecov.io/gh/jedwards1211/es2015-library-skeleton)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This is my personal skeleton for creating an ES2015 library npm package.  You are welcome to use it.

## Quick start

```sh
npm i -g howardroark/pollinate
pollinate https://github.com/jedwards1211/es2015-library-skeleton.git --keep-history --name <package name> --author <your name> --organization <github organization> --description <package description>
cd <package name>
npm i
```

## Tools used

* babel 6
* babel-preset-env
* mocha
* chai
* istanbul
* nyc
* babel-plugin-istanbul
* eslint
* eslint-watch
* flow
* flow-watch
* pre-commit (runs eslnt and flow)
* semantic-release
* Travis CI
* Coveralls
>>>>>>> 83bcb673fd60bdafcfecf3dbf166a0dcb2a5340b

