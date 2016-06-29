/** @jsx createElement */

import { createElement } from 'elliptical'
import { setClipboard } from 'lacona-api'

import { Command } from 'lacona-phrases'
import math from 'mathjs'

function evaluate (expression) {
  const node = math.parse(expression)
  const code = node.compile()
  const result = code.eval()
  if (result.format) {
    return `${node.toString()} = ${result.format(15)}` 
  } else {
    return `${node.toString()} = ${result.toString()}` 
  }
}

function isValid (expression) {
  try {
    math.eval(expression)
    return true
  } catch (e) {
    return false
  }
}

const Calculate = {
  extends: [Command],
  execute (result) {
    setClipboard({text: evaluate(result.expression)})
  },
  preview (result) {
    const answer = evaluate(result.expression)
    return {type: 'text', value: answer}
  },
  describe () {
    return (
      <sequence>
        <literal text='calculate ' />
        <placeholder argument='expression' id='expression'>
          <freetext filter={isValid} consumeAll />
        </placeholder>
      </sequence>
    )
  }
}

export default [Calculate]
