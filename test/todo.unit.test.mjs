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

test('count returns the total number of items (empty list is zero)', () => {
  const list = createTodoList()
  assert.equal(list.count(), 0)
})

test('count grows with each add', () => {
  const list = createTodoList()
  list.add('first')
  assert.equal(list.count(), 1)
  list.add('second')
  list.add('third')
  assert.equal(list.count(), 3)
})

test('count includes existing initial entries', () => {
  const list = createTodoList([
    { id: 5, title: 'existing', completed: false },
    { id: 6, title: 'another', completed: true },
  ])
  assert.equal(list.count(), 2)
})

test('count still counts completed items after complete', () => {
  const list = createTodoList()
  const first = list.add('first')
  const second = list.add('second')
  const third = list.add('third')
  list.complete(first.id)
  list.complete(second.id)
  assert.equal(list.count(), 3)
  assert.equal(third.completed, false)
  assert.equal(list.count(), list.list().length)
})

test('count is read-only and does not mutate the list', () => {
  const list = createTodoList([{ id: 1, title: 'alpha', completed: false }])
  const before = list.list()
  assert.equal(list.count(), 1)
  assert.deepEqual(list.list(), before)
})

test('count coexists with add complete list and version', () => {
  const list = createTodoList()
  const item = list.add('one item')
  assert.equal(list.complete(item.id).completed, true)
  assert.equal(list.count(), 1)
  assert.equal(list.list().length, list.count())
  assert.equal(list.version(), buildVersion)
})
