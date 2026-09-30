import test from 'node:test'
import assert from 'node:assert/strict'
import { createTodoList } from '../src/todo.mjs'

test('todo workflow preserves state across a realistic command sequence', () => {
  const list = createTodoList()
  const first = list.add('freeze baseline')
  const second = list.add('run no-write preflight')
  list.complete(first.id)

  assert.deepEqual(list.list(), [
    { id: 1, title: 'freeze baseline', completed: true },
    { id: 2, title: 'run no-write preflight', completed: false },
  ])
  assert.equal(second.id, 2)
})

test('clearCompleted fits into a realistic command sequence', () => {
  const list = createTodoList()
  const baseline = list.add('freeze baseline')
  const preflight = list.add('run no-write preflight')
  const evidence = list.add('collect evidence')

  assert.equal(list.complete(baseline.id).completed, true)
  assert.equal(list.complete(preflight.id).completed, true)
  assert.equal(list.complete(404), null)

  const removed = list.clearCompleted()
  assert.equal(removed, 2)

  const remaining = list.list()
  assert.equal(remaining.length, 1)
  assert.equal(remaining[0].id, evidence.id)
  assert.equal(remaining[0].title, 'collect evidence')
  assert.equal(remaining[0].completed, false)

  const followUp = list.add('publish change set')
  assert.equal(followUp.completed, false)
  assert.deepEqual(list.list().map((item) => item.title), [
    'collect evidence',
    'publish change set',
  ])

  assert.equal(list.complete(evidence.id).completed, true)
  assert.equal(list.clearCompleted(), 1)
  assert.deepEqual(list.list().map((item) => item.title), ['publish change set'])
  assert.equal(list.version(), '0.1.0')
})
