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
  assert.equal(buildVersion, '0.1.0')
})

test('exposes clearCompleted as a zero-argument method', () => {
  const list = createTodoList()
  assert.equal(typeof list.clearCompleted, 'function')
  assert.equal(list.clearCompleted.length, 0)
})

test('clearCompleted returns 0 and keeps the list untouched when nothing is completed', () => {
  const list = createTodoList([
    { id: 1, title: 'draft contract', completed: false },
    { id: 2, title: 'freeze contract', completed: false },
  ])
  const before = list.list()
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), before)
})

test('clearCompleted returns the removed count for completed entries', () => {
  const list = createTodoList([
    { id: 1, title: 'draft contract', completed: true },
    { id: 2, title: 'freeze contract', completed: true },
    { id: 3, title: 'run preflight', completed: false },
  ])
  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [{ id: 3, title: 'run preflight', completed: false }])
})

test('clearCompleted drops every completed entry and keeps unfinished ones', () => {
  const list = createTodoList([
    { id: 1, title: 'draft contract', completed: true },
    { id: 2, title: 'freeze contract', completed: false },
    { id: 3, title: 'run preflight', completed: true },
    { id: 4, title: 'collect evidence', completed: false },
  ])
  const removed = list.clearCompleted()
  assert.equal(removed, 2)
  const remaining = list.list()
  assert.deepEqual(remaining, [
    { id: 2, title: 'freeze contract', completed: false },
    { id: 4, title: 'collect evidence', completed: false },
  ])
  for (const id of [1, 3]) {
    assert.equal(remaining.some((item) => item.id === id), false)
  }
})

test('clearCompleted preserves ids and relative order of the remaining entries', () => {
  const list = createTodoList([
    { id: 5, title: 'keep five', completed: true },
    { id: 2, title: 'keep two', completed: false },
    { id: 9, title: 'keep nine', completed: false },
    { id: 7, title: 'keep seven', completed: false },
  ])
  assert.equal(list.clearCompleted(), 1)
  assert.deepEqual(
    list.list().map((item) => item.id),
    [2, 9, 7],
  )
})

test('clearCompleted clears every entry when all are completed and is idempotent', () => {
  const list = createTodoList([
    { id: 1, title: 'draft contract', completed: true },
    { id: 4, title: 'freeze contract', completed: true },
  ])
  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [])
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), [])
})

test('clearCompleted on an empty list returns 0', () => {
  const list = createTodoList()
  assert.equal(list.clearCompleted(), 0)
  assert.deepEqual(list.list(), [])
})
