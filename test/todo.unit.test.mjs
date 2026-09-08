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

test('completedCount is a function returning 0 on an empty list', () => {
  const list = createTodoList()
  assert.equal(typeof list.completedCount, 'function')
  assert.equal(list.completedCount(), 0)
})

test('completedCount counts only completed===true initial items', () => {
  const list = createTodoList([
    { id: 1, title: 'done', completed: true },
    { id: 2, title: 'pending', completed: false },
    { id: 3, title: 'no-completed-field' },
  ])
  assert.equal(list.completedCount(), 1)
})

test('completedCount tracks dynamic state across complete and add', () => {
  const list = createTodoList([{ id: 1, title: 'seed', completed: false }])
  assert.equal(list.completedCount(), 0)

  list.complete(1)
  assert.equal(list.completedCount(), 1)

  const added = list.add('another')
  assert.equal(list.completedCount(), 1)
  list.complete(added.id)
  assert.equal(list.completedCount(), 2)

  const sameAsFilter = list.list().filter((x) => x.completed === true).length
  assert.equal(list.completedCount(), sameAsFilter)
})

