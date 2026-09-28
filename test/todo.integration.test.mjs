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
})

test('add -> complete -> clearCompleted -> list removes completed entries end to end', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  const third = list.add('collect evidence manifest')

  list.complete(first.id)
  list.complete(third.id)

  const removed = list.clearCompleted()
  assert.equal(removed, 2)
  assert.equal(Number.isInteger(removed), true)
  assert.notEqual(removed, null)

  assert.deepEqual(list.list(), [
    { id: second.id, title: 'run no-write preflight', completed: false },
  ])

  assert.equal(second.id, 2)
  assert.equal(list.complete(first.id), null)
  assert.equal(list.complete(third.id), null)
  assert.equal(list.complete(99), null)
  assert.equal(list.clearCompleted(), 0)
})
