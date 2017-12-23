import featuresReducer from '../src/featuresReducer'
import {expect} from 'chai'
import {createReducer} from 'mindfront-redux-utils'
import {addFeature, installFeature, replaceFeature} from '../src/actions'

describe('featuresReducer', () => {
  const reducer = featuresReducer()
  it('defaults initial state to empty object', () => {
    expect(reducer(undefined, {})).to.deep.equal({})
  })
  it('supports custom createReducer', () => {
    const reducer = featuresReducer({
      createReducer,
    })
    expect(reducer.actionHandlers).to.exist
  })
  it('handles addFeature correctly', () => {
    expect(reducer({}, addFeature('a', {hello: 'world'}))).to.deep.equal({a: {hello: 'world'}})
    expect(reducer({b: {test: 1}}, addFeature('a', {hello: 'world'}))).to.deep.equal({b: {test: 1}, a: {hello: 'world'}})
    expect(reducer({a: {hello: 'world'}}, addFeature('a', {a: 1}))).to.deep.equal({a: {hello: 'world'}})
  })
  it('handles installFeature correctly', () => {
    expect(reducer({}, installFeature('a', {hello: 'world'}))).to.deep.equal({a: {hello: 'world'}})
    expect(reducer({b: {test: 1}}, installFeature('a', {hello: 'world'}))).to.deep.equal({b: {test: 1}, a: {hello: 'world'}})
    expect(reducer({a: {hello: 'world'}}, installFeature('a', {a: 1}))).to.deep.equal({a: {a: 1}})
  })
  it('handles replaceFeature correctly', () => {
    expect(reducer({}, replaceFeature('a', {}))).to.deep.equal({})
    expect(reducer({b: {test: 1}}, replaceFeature('a', {}))).to.deep.equal({b: {test: 1}})
    expect(reducer({a: {hello: 'world'}}, replaceFeature('a', {a: 1}))).to.deep.equal({a: {a: 1}})
  })
})


