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

test('reports isEmpty() correctly for empty initial lists', () => {
  assert.equal(createTodoList().isEmpty(), true)
  assert.equal(createTodoList([]).isEmpty(), true)
})

test('reports isEmpty() correctly for non-empty lists, including after add()', () => {
  const seeded = createTodoList([{ id: 1, title: 'seed item', completed: false }])
  assert.equal(seeded.isEmpty(), false)

  const empty = createTodoList()
  assert.equal(empty.isEmpty(), true)
  empty.add('grow the list')
  assert.equal(empty.isEmpty(), false)
})
