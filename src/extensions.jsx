/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { setClipboard } from 'lacona-api'

import { Command } from 'lacona-phrases'
import math from 'mathjs'
import { fromPromise } from 'rxjs/observable/fromPromise'

const MathSource = {
  clear: true,
  fetch ({props}) {
    const promise = Promise.resolve().then(() => {
      try {
        const node = math.parse(props.expression)
        const code = node.compile()
        let result = code.eval()
      } catch (e) {
        return
      }

      try {
        if (math.equal(result, 0)) {
          result = 0
        }
      } catch (e) {}

      return {
        texExpression: [`${node.toTex()} =`, math.format(result, {precision: 10})],
        answer: math.format(result, {precision: 10})
      }
    }).catch((e) => {
      console.error(props.expression, e)
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
  describe ({observe}) {
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

export default [Calculate]
