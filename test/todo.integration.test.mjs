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

test('todo workflow add -> complete -> clearCompleted -> list drops the completed entry', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')

  assert.deepEqual(first, { id: 1, title: 'freeze baseline', completed: false })
  assert.deepEqual(second, { id: 2, title: 'run no-write preflight', completed: false })

  const completed = list.complete(first.id)
  assert.equal(completed.completed, true)
  assert.equal(completed.id, 1)

  const removed = list.clearCompleted()
  assert.equal(typeof removed, 'number')
  assert.equal(Number.isInteger(removed), true)
  assert.equal(removed, 1)

  assert.deepEqual(list.list(), [{ id: 2, title: 'run no-write preflight', completed: false }])
  assert.equal(list.complete(first.id), null)
})
