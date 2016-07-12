/** @jsx createElement */

import _ from 'lodash'
import { createElement } from 'elliptical'
import { setClipboard } from 'lacona-api'

import { Command } from 'lacona-phrases'
import math from 'mathjs'
// math.config({
//   number: 'BigNumber'
// })

function evaluateTex (expression) {
  const node = math.parse(expression)
  const code = node.compile()
  let result = code.eval()

  // This fixes weird things like sin(pi) not equaling 0
  try {
    if (math.equal(result, 0)) {
      result = 0
    }
  } catch (e) {}

  return [`${node.toTex()} =`, math.format(result, {precision: 10})]
}

function evaluateAnswer (expression) {
  const node = math.parse(expression)
  const code = node.compile()
  const result = code.eval()
  let answer
  if (result.format) {
    return result.format(15)
  } else {
    return result.toString()
  }
}

function isValid (expression) {
  try {
    const output = math.eval(expression)
    if (_.startsWith(output, 'function ')) {
      return false
    } else {
      return true
    }
  } catch (e) {
    return false
  }
}

const Calculate = {
  extends: [Command],
  execute (result) {
    const answer = evaluateAnswer(result.expression)
    setClipboard({text: answer})
  },
  preview (result) {
    const answer = evaluateTex(result.expression)
    return {type: 'tex', value: answer}
  },
  describe () {
    return (
      <sequence>
        <list items={['calculate ', 'compute ']} limit={1} />
        <placeholder argument='expression' id='expression'>
          <freetext filter={isValid} consumeAll />
        </placeholder>
      </sequence>
    )
  }
}

export default [Calculate]
