import test from 'node:test'
import assert from 'node:assert/strict'
import { buildVersion, createTodoList } from '../src/todo.mjs'

test('adds and lists todos', () => {
  const list = createTodoList()
  assert.deepEqual(list.add('write evidence manifest'), {
    id: 1,
    title: 'write evidence manifest',
    completed: false,
  })
  assert.deepEqual(list.list(), [{ id: 1, title: 'write evidence manifest', completed: false }])
})

test('completes an existing todo and ignores unknown ids', () => {
  const list = createTodoList([{ id: 3, title: 'run doctor', completed: false }])
  assert.equal(list.complete(3).completed, true)
  assert.equal(list.complete(99), null)
})

test('exposes a traceable build version', () => {
  assert.equal(createTodoList().version(), buildVersion)
  assert.match(buildVersion, /^\d+\.\d+\.\d+$/)
})

test('toggle flips completed and returns a shallow copy of the matched item', () => {
  const list = createTodoList([{ id: 3, title: 'run doctor', completed: false }])
  const item = list.list()[0]

  const flipped = list.toggle(3)
  assert.equal(flipped.completed, true)
  assert.notEqual(flipped, item)
  assert.deepEqual(list.list(), [{ id: 3, title: 'run doctor', completed: true }])

  const flippedBack = list.toggle(3)
  assert.equal(flippedBack.completed, false)
  assert.deepEqual(list.list(), [{ id: 3, title: 'run doctor', completed: false }])
})

test('toggle returns null for unmatched ids and leaves state and order unchanged', () => {
  const before = [
    { id: 1, title: 'freeze baseline', completed: false },
    { id: 2, title: 'run no-write preflight', completed: true },
  ]
  const list = createTodoList(before)

  assert.equal(list.toggle(99), null)
  assert.equal(list.toggle('3'), null)
  assert.deepEqual(list.list(), before)
})
