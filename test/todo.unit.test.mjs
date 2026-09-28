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
  const single = createTodoList()
  single.add('draft plan')
  single.add('run doctor')
  single.add('publish report')
  single.complete(2)

  const removedOnce = single.clearCompleted()
  assert.equal(removedOnce, 1)
  assert.equal(typeof removedOnce, 'number')
  assert.equal(Number.isInteger(removedOnce), true)
  assert.deepEqual(single.list(), [
    { id: 1, title: 'draft plan', completed: false },
    { id: 3, title: 'publish report', completed: false },
  ])

  const double = createTodoList()
  double.add('draft plan')
  double.add('run doctor')
  double.add('publish report')
  double.complete(1)
  double.complete(3)

  assert.equal(double.clearCompleted(), 2)
  assert.deepEqual(double.list(), [{ id: 2, title: 'run doctor', completed: false }])
})

test('clearCompleted on an empty list returns 0 without throwing', () => {
  const list = createTodoList()
  const removed = list.clearCompleted()

  assert.equal(removed, 0)
  assert.equal(Number.isInteger(removed), true)
  assert.equal(Array.isArray(removed), false)
  assert.notEqual(removed, null)
  assert.deepEqual(list.list(), [])

  assert.equal(list.clearCompleted(), 0)
})

test('clearCompleted returns the total when every todo is completed and empties list()', () => {
  const list = createTodoList()
  list.add('freeze baseline')
  list.add('run no-write preflight')
  list.add('collect evidence')
  list.complete(1)
  list.complete(2)
  list.complete(3)

  const removed = list.clearCompleted()
  assert.equal(removed, 3)
  assert.equal(Number.isInteger(removed), true)
  assert.deepEqual(list.list(), [])
  assert.equal(list.clearCompleted(), 0)
})

test('clearCompleted removes adjacent completed todos in a single call', () => {
  const list = createTodoList()
  list.add('done one')
  list.add('done two')
  list.add('still active')
  list.add('done three')
  list.add('done four')
  list.complete(1)
  list.complete(2)
  list.complete(4)
  list.complete(5)

  const removed = list.clearCompleted()
  assert.equal(removed, 4)
  assert.deepEqual(list.list(), [{ id: 3, title: 'still active', completed: false }])
})

test('clearCompleted preserves remaining ids and order and keeps list() snapshots isolated', () => {
  const list = createTodoList()
  list.add('alpha')
  list.add('beta')
  list.add('gamma')
  list.add('delta')
  list.complete(2)
  list.complete(4)

  const before = list.list()
  const survivorsBefore = before
    .filter((item) => item.completed !== true)
    .map((item) => ({ id: item.id, title: item.title }))

  const removed = list.clearCompleted()
  assert.equal(removed, 2)

  const after = list.list()
  assert.deepEqual(
    after.map((item) => ({ id: item.id, title: item.title })),
    survivorsBefore,
  )

  after[0].title = 'mutated snapshot'
  assert.equal(list.list()[0].title, 'alpha')
  assert.equal(list.complete(2), null)
  assert.equal(list.complete(99), null)
})
