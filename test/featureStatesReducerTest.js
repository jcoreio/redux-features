import featureStatesReducer from '../src/featureStatesReducer'
import {expect} from 'chai'
import {createReducer} from 'mindfront-redux-utils'
import {
  addFeature, loadFeature, installFeature, replaceFeature, setFeatureState, loadInitialFeatures
} from '../src/actions'

describe('featureStatesReducer', () => {
  const reducer = featureStatesReducer()
  it('defaults initial state to empty object', () => {
    expect(reducer(undefined, {})).to.deep.equal({})
  })
  it('supports custom createReducer', () => {
    const reducer = featureStatesReducer({
      createReducer,
    })
    expect(reducer.actionHandlers).to.exist
  })
  it('handles addFeature correctly', () => {
    expect(reducer({}, addFeature('a', {}))).to.deep.equal({a: 'NOT_LOADED'})
    expect(reducer({a: 'LOADING'}, addFeature('a', {}))).to.deep.equal({a: 'LOADING'})
    expect(reducer({a: 'LOADED'}, addFeature('a', {}))).to.deep.equal({a: 'LOADED'})
  })
  it('handles loadFeature correctly', () => {
    expect(reducer({}, loadFeature('a', {}))).to.deep.equal({})
    expect(reducer({a: 'NOT_LOADED'}, loadFeature('a', {}))).to.deep.equal({a: 'LOADING'})
    expect(reducer({a: new Error('test')}, loadFeature('a', {}))).to.deep.equal({a: 'LOADING'})
    expect(reducer({a: 'LOADED'}, loadFeature('a', {}))).to.deep.equal({a: 'LOADED'})
  })
  it('handles installFeature correctly', () => {
    expect(reducer({}, installFeature('a', {}))).to.deep.equal({})
    expect(reducer({a: 'NOT_LOADED'}, installFeature('a', {}))).to.deep.equal({a: 'LOADED'})
    expect(reducer({a: 'LOADING'}, installFeature('a', {}))).to.deep.equal({a: 'LOADED'})
  })
  it('handles replaceFeature correctly', () => {
    expect(reducer({}, replaceFeature('a', {}))).to.deep.equal({})
    expect(reducer({a: 'NOT_LOADED'}, replaceFeature('a', {}))).to.deep.equal({a: 'NOT_LOADED'})
    expect(reducer({a: 'LOADED'}, replaceFeature('a', {}))).to.deep.equal({a: 'NOT_LOADED'})
  })
  it('handles setFeatureState correctly', () => {
    expect(reducer({}, setFeatureState('a', 'LOADING'))).to.deep.equal({})
    expect(reducer({a: 'NOT_LOADED'}, setFeatureState('a', 'LOADING'))).to.deep.equal({a: 'LOADING'})
    expect(reducer({a: 'LOADED'}, setFeatureState('a', 'LOADING'))).to.deep.equal({a: 'LOADING'})
  })
  it('handles loadInitialFeatures correctly', () => {
    expect(reducer({}, loadInitialFeatures())).to.deep.equal({})
    expect(reducer({a: 'NOT_LOADED', b: 'LOADING', c: 'LOADED'}, loadInitialFeatures())).to.deep.equal({
      a: 'NOT_LOADED',
      b: 'LOADING',
      c: 'LOADING',
    })
  })
})


