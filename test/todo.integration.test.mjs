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

test('add -> complete -> clearCompleted -> list drops only completed entries', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  const third = list.add('write evidence manifest')

  assert.equal(list.complete(first.id).completed, true)
  assert.equal(list.complete(third.id).completed, true)
  assert.equal(list.complete(9999), null)

  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [
    { id: second.id, title: 'run no-write preflight', completed: false },
  ])
  assert.equal(list.complete(first.id), null)
  assert.equal(list.complete(third.id), null)
  assert.equal(list.clearCompleted(), 0)
})
