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
  const third = list.add('collect evidence')
  list.complete(second.id)

  const before = list.list().length
  const removed = list.clearCompleted()

  assert.equal(typeof removed, 'number')
  assert.equal(Number.isInteger(removed), true)
  assert.notEqual(removed, null)
  assert.equal(Array.isArray(removed), false)
  assert.equal(removed, 1)
  assert.equal(before - list.list().length, removed)
  assert.deepEqual(list.list(), [
    { id: 1, title: 'freeze baseline', completed: false },
    { id: 3, title: 'collect evidence', completed: false },
  ])
  assert.equal(
    list.list().some((item) => item.completed === true),
    false,
  )
  assert.equal(first.id, 1)
  assert.equal(third.id, 3)
})

test('clearCompleted returns 0 when nothing was completed', () => {
  assert.equal(createTodoList().clearCompleted(), 0)
  assert.equal(createTodoList([]).clearCompleted(), 0)
  assert.deepEqual(createTodoList([]).list(), [])

  const list = createTodoList()
  list.add('keep me')
  const removed = list.clearCompleted()
  assert.equal(removed, 0)
  assert.notEqual(removed, null)
  assert.deepEqual(list.list(), [{ id: 1, title: 'keep me', completed: false }])
})

test('clearCompleted returns the total and empties the list when everything is completed', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  list.complete(first.id)
  list.complete(second.id)

  assert.equal(list.clearCompleted(), 2)
  assert.deepEqual(list.list(), [])
})

test('clearCompleted removes adjacent completed todos in a single call', () => {
  const list = createTodoList()
  const first = list.add('first')
  const second = list.add('second')
  const third = list.add('third')
  const fourth = list.add('fourth')
  list.complete(first.id)
  list.complete(second.id)
  list.complete(third.id)

  assert.equal(list.clearCompleted(), 3)
  assert.deepEqual(list.list(), [{ id: 4, title: 'fourth', completed: false }])
  assert.equal(fourth.id, 4)
})

test('clearCompleted keeps ids and relative order of the remaining todos', () => {
  const list = createTodoList()
  const first = list.add('first')
  const second = list.add('second')
  const third = list.add('third')
  const fourth = list.add('fourth')
  list.complete(second.id)

  const idsBefore = list.list().map((item) => item.id)
  list.clearCompleted()
  const idsAfter = list.list().map((item) => item.id)

  assert.deepEqual(idsAfter, [first.id, third.id, fourth.id])
  assert.deepEqual(
    idsAfter,
    idsBefore.filter((id) => id !== second.id),
  )
  assert.deepEqual(list.list(), [
    { id: 1, title: 'first', completed: false },
    { id: 3, title: 'third', completed: false },
    { id: 4, title: 'fourth', completed: false },
  ])
})

test('clearCompleted keeps complete() returning null for deleted and unknown ids', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  list.add('run no-write preflight')
  list.complete(first.id)

  assert.equal(list.clearCompleted(), 1)
  assert.equal(list.complete(first.id), null)
  assert.equal(list.complete(99), null)

  assert.deepEqual(list.list(), [{ id: 2, title: 'run no-write preflight', completed: false }])
  const added = list.add('after cleanup')
  assert.equal(added.id, 3)
})

test('clearCompleted is deterministic for the same input sequence', () => {
  const run = () => {
    const list = createTodoList()
    const first = list.add('freeze baseline')
    const second = list.add('run no-write preflight')
    const third = list.add('collect evidence')
    list.complete(second.id)
    list.complete(third.id)
    return { removed: list.clearCompleted(), remaining: list.list(), keptId: first.id }
  }

  const firstRun = run()
  const secondRun = run()

  assert.equal(firstRun.removed, 2)
  assert.deepEqual(firstRun, secondRun)
  assert.deepEqual(firstRun.remaining, [
    { id: 1, title: 'freeze baseline', completed: false },
  ])
})
