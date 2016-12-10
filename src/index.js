/* @flow */

import featuresReducer from './featuresReducer'
import featureStatesReducer from './featureStatesReducer'
import featureReducersReducer from './featureReducersReducer'
import loadFeatureMiddleware from './loadFeatureMiddleware'
import loadFeatureSyncMiddleware from './loadFeatureSyncMiddleware'
import featureMiddlewaresMiddleware from './featureMiddlewaresMiddleware'
import {
  ACTION_TYPE_PREFIX,
  ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE,
  addFeature, loadFeature, installFeature, replaceFeature, setFeatureState,
} from './actions'

export {
  featuresReducer,
  featureStatesReducer,
  featureReducersReducer,
  loadFeatureMiddleware,
  loadFeatureSyncMiddleware,
  featureMiddlewaresMiddleware,
  ACTION_TYPE_PREFIX,
  ADD_FEATURE, LOAD_FEATURE, INSTALL_FEATURE, REPLACE_FEATURE, SET_FEATURE_STATE,
  addFeature, loadFeature, installFeature, replaceFeature, setFeatureState,
}

