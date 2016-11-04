/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { setClipboard } from 'lacona-api'

import { Command } from 'lacona-phrases'
const mathjs = require('mathjs')
import { fromPromise } from 'rxjs/observable/fromPromise'

const MathSource = {
  clear: true,
  fetch ({props}) {
    const promise = Promise.resolve().then(() => {
      let node
      let code
      let result
      try {
        node = mathjs.parse(props.expression)
        code = node.compile()
        result = code.eval()
      } catch (e) {
        return
      }

      try {
        if (mathjs.equal(result, 0)) {
          result = 0
        }
      } catch (e) {}

      return {
        texExpression: [`${node.toTex()} =`, mathjs.format(result, {precision: 10})],
        answer: mathjs.format(result, {precision: 10})
      }
    }).catch((e) => {
      console.error('Error calculating', props.expression, e)
      return null
    })

    return fromPromise(promise)
  }
}

function describeMath (input, observe) {
  const data = observe(<MathSource expression={input} />)
  if (data) {
    return <literal
      text={input}
      value={{
        texExpression: data.texExpression,
        answer: data.answer
      }} />
  }
}

const Calculate = {
  extends: [Command],
  execute (result) {
    if (result.answer) {
      setClipboard({text: result.answer})
    }
  },
  preview (result) {
    if (result.texExpression) {
      return {type :'tex', value: result.texExpression}
    }
  },
  describe ({observe, config}) {
    if (config.enableCalculate) {
      return (
        <sequence>
          <list items={['calculate ', 'compute ', 'convert ']} limit={1} />
          <placeholder argument='expression' merge>
            <dynamic describe={input => describeMath(input, observe)} consumeAll />
          </placeholder>
        </sequence>
      )
    }
  }
}

export default [Calculate]
