/* @flow */

import featuresReducer from './featuresReducer'
import featureStatesReducer from './featureStatesReducer'
import featureReducersReducer from './featureReducersReducer'
import loadFeatureMiddleware from './loadFeatureMiddleware'
import featureMiddlewaresMiddleware from './featureMiddlewaresMiddleware'
import {defaultComposeReducers} from './defaults'
import {
  ACTION_TYPE_PREFIX,
  ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE, LOAD_INITIAL_FEATURES,
  addFeature, loadFeature, installFeature, replaceFeature, setFeatureState, loadInitialFeatures,
} from './actions'

export {
  featuresReducer,
  featureStatesReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  featureMiddlewaresMiddleware,
  defaultComposeReducers as composeReducers,
  ACTION_TYPE_PREFIX,
  ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE, LOAD_INITIAL_FEATURES,
  addFeature, loadFeature, installFeature, replaceFeature, setFeatureState, loadInitialFeatures,
}

