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

test('first returns a shallow copy of the leading todo for non-empty lists', () => {
  const list = createTodoList([{ id: 7, title: 'write x', completed: false }])
  list.add('second item')
  const expectedFirst = list.list()[0]
  const first = list.first()
  assert.deepEqual(first, expectedFirst)
  // independent objects: mutating the copy must not change the internal item
  assert.notEqual(first, list.list()[0])
  assert.notEqual(first, list.first())
  first.title = 'mutated'
  assert.equal(list.list()[0].title, 'write x')
})

test('first returns null for an empty list without throwing', () => {
  assert.equal(createTodoList().first(), null)
  assert.equal(createTodoList([]).first(), null)
})

test('first result is not polluted by later add/complete mutations', () => {
  const list = createTodoList([{ id: 1, title: 'first task', completed: false }])
  const snapshot = list.first()
  list.add('added later')
  list.complete(1)
  // snapshot is a detached shallow copy taken before later mutations
  assert.deepEqual(snapshot, { id: 1, title: 'first task', completed: false })
  // the live first() now reflects the completed state on a fresh object
  assert.deepEqual(list.first(), { id: 1, title: 'first task', completed: true })
  assert.notEqual(snapshot, list.first())
})
