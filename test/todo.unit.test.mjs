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

test('peek returns 0 for an empty list', () => {
  assert.equal(createTodoList().peek(), 0)
})

test('peek tracks each added todo and matches list length', () => {
  const list = createTodoList()
  assert.equal(list.peek(), 0)
  list.add('first')
  assert.equal(list.peek(), 1)
  list.add('second')
  assert.equal(list.peek(), 2)
  list.add('third')
  assert.equal(list.peek(), list.list().length)
})

test('peek counts items seeded through the initial list', () => {
  const list = createTodoList([
    { id: 1, title: 'alpha', completed: false },
    { id: 2, title: 'beta', completed: true },
  ])
  assert.equal(list.peek(), 2)
  assert.equal(list.peek(), list.list().length)
})
