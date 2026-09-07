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

test('clearCompleted removes completed items and returns the count', () => {
  const list = createTodoList([
    { id: 1, title: 'done a', completed: true },
    { id: 2, title: 'active a', completed: false },
    { id: 3, title: 'done b', completed: true },
  ])
  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [{ id: 2, title: 'active a', completed: false }])
})

test('clearCompleted returns 0 and is a no-op when nothing is completed', () => {
  const list = createTodoList([
    { id: 1, title: 'active a', completed: false },
    { id: 2, title: 'active b', completed: false },
  ])
  const before = list.list()
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), before)
})

test('clearCompleted on an empty list returns 0 and stays empty', () => {
  const list = createTodoList()
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), [])
})

test('clearCompleted preserves active ids and their relative order', () => {
  const list = createTodoList([
    { id: 5, title: 'active a', completed: false },
    { id: 9, title: 'done', completed: true },
    { id: 7, title: 'active b', completed: false },
  ])
  list.clearCompleted()
  assert.deepEqual(
    list.list().map((item) => item.id),
    [5, 7],
  )
})

test('clearCompleted twice returns 0 on the second call and leaves state intact', () => {
  const list = createTodoList([
    { id: 1, title: 'active', completed: false },
    { id: 2, title: 'done', completed: true },
  ])
  assert.equal(list.clearCompleted(), 1)
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), [{ id: 1, title: 'active', completed: false }])
})
