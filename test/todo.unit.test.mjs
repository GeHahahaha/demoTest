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

test('isEmpty() returns true only when there are no todos', () => {
  const empty = createTodoList()
  assert.equal(empty.isEmpty(), true)
  assert.equal(empty.isEmpty() === (empty.list().length === 0), true)

  const filled = createTodoList()
  filled.add('write a todo')
  assert.equal(filled.isEmpty(), false)
  assert.equal(filled.isEmpty() === (filled.list().length === 0), true)
})

test('isEmpty() is false when only a completed todo exists', () => {
  const list = createTodoList([{ id: 1, title: 'done item', completed: true }])
  assert.equal(list.isEmpty(), false)
  assert.equal(list.list().length, 1)
})
