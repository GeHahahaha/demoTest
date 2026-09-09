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

test('gets an existing todo as a defensive copy', () => {
  const list = createTodoList([
    { id: 1, title: 'write evidence manifest', completed: false },
    { id: 2, title: 'run doctor', completed: true },
  ])
  assert.deepEqual(list.get(1), {
    id: 1,
    title: 'write evidence manifest',
    completed: false,
  })
  assert.deepEqual(list.get(2), { id: 2, title: 'run doctor', completed: true })
  assert.notEqual(list.get(1), list.list()[0])
})

test('get returns a copy that does not mutate internal state', () => {
  const list = createTodoList([{ id: 5, title: 'write report', completed: false }])
  const found = list.get(5)
  found.title = 'tampered'
  found.completed = true
  assert.deepEqual(list.get(5), {
    id: 5,
    title: 'write report',
    completed: false,
  })
  assert.deepEqual(list.list(), [
    { id: 5, title: 'write report', completed: false },
  ])
})

test('get returns null for unknown ids', () => {
  const list = createTodoList([{ id: 3, title: 'run doctor', completed: false }])
  assert.equal(list.get(99), null)
  assert.equal(list.get(), null)
  assert.equal(list.get('3'), null)
  assert.equal(list.list().length, 1)
})
