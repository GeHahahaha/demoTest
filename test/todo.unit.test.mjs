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

test('exposes clearCompleted as a no-argument method returning an integer', () => {
  const list = createTodoList()
  assert.equal(typeof list.clearCompleted, 'function')
  assert.equal(list.clearCompleted.length, 0)
  const removed = list.clearCompleted()
  assert.equal(typeof removed, 'number')
  assert.equal(Number.isInteger(removed), true)
})

test('returns 0 for an empty list and for a list without completed entries', () => {
  const empty = createTodoList()
  assert.equal(empty.clearCompleted(), 0)
  assert.deepEqual(empty.list(), [])

  const untouched = createTodoList([
    { id: 1, title: 'keep alpha', completed: false },
    { id: 2, title: 'keep beta', completed: false },
  ])
  const snapshot = untouched.list()
  assert.equal(untouched.clearCompleted(), 0)
  assert.deepEqual(untouched.list(), snapshot)
})

test('removes only completed entries and returns the removed count', () => {
  const list = createTodoList([
    { id: 1, title: 'done alpha', completed: true },
    { id: 2, title: 'open beta', completed: false },
    { id: 3, title: 'done gamma', completed: true },
  ])

  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [{ id: 2, title: 'open beta', completed: false }])
})

test('returns the total count and empties list() when every entry was completed', () => {
  const list = createTodoList([
    { id: 1, title: 'done alpha', completed: true },
    { id: 2, title: 'done beta', completed: true },
  ])

  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [])
  assert.equal(list.clearCompleted(), 0)
})

test('removes adjacent completed entries without skipping any', () => {
  const list = createTodoList([
    { id: 1, title: 'open alpha', completed: false },
    { id: 2, title: 'done beta', completed: true },
    { id: 3, title: 'done gamma', completed: true },
    { id: 4, title: 'done delta', completed: true },
    { id: 5, title: 'open epsilon', completed: false },
  ])

  assert.equal(list.clearCompleted(), 3)
  assert.deepEqual(list.list(), [
    { id: 1, title: 'open alpha', completed: false },
    { id: 5, title: 'open epsilon', completed: false },
  ])
})

test('preserves active ids and relative order and keeps nextId behaviour unchanged', () => {
  const list = createTodoList([
    { id: 2, title: 'done alpha', completed: true },
    { id: 5, title: 'open beta', completed: false },
    { id: 9, title: 'done gamma', completed: true },
    { id: 12, title: 'open delta', completed: false },
  ])

  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(
    list.list().map((item) => item.id),
    [5, 12],
  )
  assert.equal(list.add('fresh epsilon').id, 13)
})

test('keeps the contract of complete(), add() and list() after clearing', () => {
  const list = createTodoList([{ id: 1, title: 'done alpha', completed: true }])
  assert.equal(list.clearCompleted(), 1)
  assert.equal(list.complete(1), null)
  assert.equal(list.complete(99), null)

  const added = list.add('open beta')
  assert.deepEqual(added, { id: 1, title: 'open beta', completed: false })

  const listed = list.list()
  listed[0].title = 'mutated copy'
  assert.equal(list.list()[0].title, 'open beta')
})
