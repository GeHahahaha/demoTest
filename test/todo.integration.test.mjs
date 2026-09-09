import test from 'node:test'
import assert from 'node:assert/strict'
import { createTodoList } from '../src/todo.mjs'

test('todo workflow preserves state across a realistic command sequence', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  list.complete(first.id)

  assert.deepEqual(list.list(), [
    { id: 1, title: 'freeze baseline', completed: true },
    { id: 2, title: 'run no-write preflight', completed: false },
  ])
  assert.equal(second.id, 2)

  // peek reflects the live total across the command sequence
  assert.equal(list.peek(), 2)
  assert.equal(list.peek(), list.list().length)
  list.complete(second.id)
  assert.equal(list.peek(), 2)
  assert.equal(list.peek(), list.list().length)
  const third = list.add('ship evidence')
  assert.equal(list.peek(), 3)
  assert.equal(third.id, 3)
  assert.equal(list.list().length, 3)
})
