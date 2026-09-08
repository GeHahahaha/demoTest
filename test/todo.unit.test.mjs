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

test('has returns true for an existing id and false for an unknown id', () => {
  const list = createTodoList([{ id: 1, title: 'freeze baseline', completed: false }])
  assert.equal(list.has(1), true)
  assert.equal(list.has(99), false)
})

test('has returns false on an empty list for any id', () => {
  const list = createTodoList()
  assert.equal(list.has(1), false)
  assert.equal(list.has('anything'), false)
  assert.equal(list.has(undefined), false)
})

test('has follows strict equality: id 1 entry matches has(1) but not has("1")', () => {
  const list = createTodoList([{ id: 1, title: 'freeze baseline', completed: false }])
  assert.equal(list.has(1), true)
  assert.equal(list.has('1'), false)
})

test('has handles invalid inputs by returning false', () => {
  const list = createTodoList([{ id: 1, title: 'freeze baseline', completed: false }])
  assert.equal(list.has(null), false)
  assert.equal(list.has(undefined), false)
})

test('has reports existence correctly for a list containing duplicate ids', () => {
  const list = createTodoList([
    { id: 3, title: 'run doctor', completed: false },
    { id: 3, title: 'second doctor run', completed: false },
  ])
  assert.equal(list.has(3), true)
  assert.equal(list.has(4), false)
})
