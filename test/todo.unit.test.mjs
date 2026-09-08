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

test('removes an existing todo, returning a snapshot and dropping it from list()', () => {
  const list = createTodoList([
    { id: 1, title: 'keep', completed: false },
    { id: 3, title: 'drop', completed: true },
  ])
  const dropped = list.remove(3)
  assert.deepEqual(dropped, { id: 3, title: 'drop', completed: true })
  // Snapshot is a fresh object, not an internal mutable reference.
  assert.notEqual(dropped, list.list()[0])
  assert.deepEqual(list.list(), [{ id: 1, title: 'keep', completed: false }])
})

test('mutating the removed snapshot does not corrupt internal state', () => {
  const list = createTodoList([{ id: 2, title: 'guard', completed: false }])
  const dropped = list.remove(2)
  dropped.title = 'mutated'
  dropped.completed = true
  assert.deepEqual(list.list(), [])
})

test('removing an unknown id returns null and leaves the list unchanged', () => {
  const seed = [
    { id: 1, title: 'one', completed: false },
    { id: 2, title: 'two', completed: true },
  ]
  const list = createTodoList(seed)
  const before = list.list()
  assert.equal(list.remove(99), null)
  assert.deepEqual(list.list(), before)
})

test('remove from an empty list returns null', () => {
  assert.equal(createTodoList().remove(1), null)
})

test('remove twice on the same id returns the item then null (slot released)', () => {
  const list = createTodoList([{ id: 7, title: 'once', completed: false }])
  assert.deepEqual(list.remove(7), { id: 7, title: 'once', completed: false })
  assert.equal(list.remove(7), null)
})
