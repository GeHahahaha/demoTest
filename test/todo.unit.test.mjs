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

test('removeCompleted exists as a zero-arg callable method', () => {
  const list = createTodoList()
  assert.equal(typeof list.removeCompleted, 'function')
  assert.equal(list.removeCompleted(), 0)
})

test('removeCompleted strips every completed item and keeps survivors', () => {
  const list = createTodoList([
    { id: 10, title: 'alpha', completed: true },
    { id: 11, title: 'beta', completed: false },
    { id: 12, title: 'gamma', completed: false },
    { id: 13, title: 'delta', completed: true },
  ])
  list.complete(12) // additionally complete a survivor via complete()
  const removed = list.removeCompleted()

  assert.equal(removed, 3) // alpha + delta (initial) + gamma (newly completed)
  const survivors = list.list()
  assert.ok(survivors.every((item) => item.completed === false))
  assert.deepEqual(
    survivors.map((item) => item.title),
    ['beta'],
  )
})

test('removeCompleted preserves relative order of surviving items', () => {
  const list = createTodoList()
  list.add('a') // id 1
  list.add('b') // id 2
  list.add('c') // id 3
  list.add('d') // id 4
  list.complete(2) // remove b
  list.complete(3) // remove c
  const removed = list.removeCompleted()

  assert.equal(removed, 2)
  assert.deepEqual(
    list.list().map((item) => item.title),
    ['a', 'd'],
  )
})

test('removeCompleted counts every removed completion accurately', () => {
  const list = createTodoList()
  ;['a', 'b', 'c', 'd', 'e'].forEach((title) => list.add(title))
  ;[2, 4].forEach((id) => list.complete(id))
  const before = list.list().length
  const removed = list.removeCompleted()
  const after = list.list().length

  assert.equal(removed, 2)
  assert.equal(before - after, removed)
})

test('removeCompleted returns 0 and leaves an empty list untouched', () => {
  const list = createTodoList()
  const snapshot = list.list()
  assert.equal(list.removeCompleted(), 0)
  assert.deepEqual(list.list(), snapshot)
})

test('removeCompleted returns 0 and does not change an all-open list', () => {
  const list = createTodoList([{ id: 1, title: 'open', completed: false }])
  const snapshot = list.list()
  assert.equal(list.removeCompleted(), 0)
  assert.deepEqual(list.list(), snapshot)
})
