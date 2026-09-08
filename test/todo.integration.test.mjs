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

test('completedCount matches list-derived count across a command sequence', () => {
  const list = createTodoList([{ id: 5, title: 'already done', completed: true }])
  const consistency = () => list.completedCount() === list.list().filter((x) => x.completed).length

  // initial completed-only list
  assert.ok(consistency())
  assert.equal(list.completedCount(), 1)

  const added = list.add('fresh task')
  assert.ok(consistency())
  assert.equal(list.completedCount(), 1)

  list.complete(added.id)
  assert.ok(consistency())
  assert.equal(list.completedCount(), 2)

  list.add('another pending')
  assert.ok(consistency())
  assert.equal(list.completedCount(), 2)
})
