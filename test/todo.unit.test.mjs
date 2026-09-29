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

test('clearCompleted removes only completed todos and returns the removed count', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  const third = list.add('publish evidence manifest')
  list.complete(first.id)
  list.complete(third.id)

  const before = list.list().filter((item) => item.completed === false)
  const removed = list.clearCompleted()

  assert.equal(removed, 2)
  assert.ok(Number.isInteger(removed))
  assert.deepEqual(list.list(), before)
  assert.deepEqual(list.list(), [{ id: second.id, title: 'run no-write preflight', completed: false }])
})

test('clearCompleted returns 0 for an empty list and for unfinished lists', () => {
  const empty = createTodoList()
  const emptyRemoved = empty.clearCompleted()
  assert.equal(emptyRemoved, 0)
  assert.ok(Number.isInteger(emptyRemoved))

  const unfinished = createTodoList([{ id: 1, title: 'a', completed: false }])
  assert.equal(unfinished.clearCompleted(), 0)
  assert.deepEqual(unfinished.list(), [{ id: 1, title: 'a', completed: false }])
})

test('clearCompleted returns the total when every todo is completed', () => {
  const list = createTodoList([
    { id: 1, title: 'a', completed: true },
    { id: 2, title: 'b', completed: true },
  ])
  const total = list.list().length

  assert.equal(list.clearCompleted(), total)
  assert.deepEqual(list.list(), [])
})

test('clearCompleted removes adjacent completed todos in one call', () => {
  const list = createTodoList([
    { id: 1, title: 'a', completed: false },
    { id: 2, title: 'b', completed: true },
    { id: 3, title: 'c', completed: true },
    { id: 4, title: 'd', completed: true },
    { id: 5, title: 'e', completed: false },
  ])

  assert.equal(list.clearCompleted(), 3)
  assert.deepEqual(list.list(), [
    { id: 1, title: 'a', completed: false },
    { id: 5, title: 'e', completed: false },
  ])
})

test('clearCompleted keeps remaining ids unique and never exposes internal items', () => {
  const list = createTodoList([{ id: 1, title: 'a', completed: true }])
  list.clearCompleted()

  assert.equal(Object.keys(list).includes('items'), false)
  list.add('b')
  list.add('c')

  const ids = list.list().map((item) => item.id)
  assert.equal(new Set(ids).size, ids.length)
})
