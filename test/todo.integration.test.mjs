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

test('clearCompleted end-to-end removes done items and keeps id allocation continuing', () => {
  const list = createTodoList()
  const doneOne = list.add('write requirements')
  list.add('draft design')
  list.add('implement feature')
  const doneTwo = list.add('run lint')
  list.complete(doneOne.id)
  list.complete(doneTwo.id)

  const removed = list.clearCompleted()

  assert.equal(removed, 2)
  assert.deepEqual(list.list(), [
    { id: 2, title: 'draft design', completed: false },
    { id: 3, title: 'implement feature', completed: false },
  ])

  const next = list.add('write evidence manifest')
  assert.equal(next.id, 4)
})
