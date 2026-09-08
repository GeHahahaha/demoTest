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
  assert.equal(list.count(), list.list().length)
  assert.equal(list.count(), 2)
})

test('count reflects the running total across a realistic command sequence', () => {
  const list = createTodoList()
  const a = list.add('first')
  const b = list.add('second')
  assert.equal(list.count(), 2)
  list.complete(a.id)
  // list now has one completed and one pending item.
  assert.equal(list.count(), 2)
  const c = list.add('third')
  list.complete(b.id)
  assert.equal(c.id, 3)
  assert.equal(list.count(), 3)
  assert.deepEqual(list.list(), [
    { id: 1, title: 'first', completed: true },
    { id: 2, title: 'second', completed: true },
    { id: 3, title: 'third', completed: false },
  ])
  assert.equal(list.count(), list.list().length)
})

test('count on a fresh empty list is zero', () => {
  assert.equal(createTodoList().count(), 0)
})
