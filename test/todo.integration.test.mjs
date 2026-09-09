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

test('removeCompleted fits a real add -> complete -> remove -> continue command flow', () => {
  const list = createTodoList([
    { id: 5, title: 'seed already done', completed: true },
    { id: 6, title: 'seed still open', completed: false },
  ])
  list.add('archive evidence')
  list.complete(6)

  const removed = list.removeCompleted()
  assert.equal(removed, 2) // seed already done + completed id 6

  const survivors = list.list()
  assert.deepEqual(
    survivors.map(({ title, completed }) => ({ title, completed })),
    [
      { title: 'archive evidence', completed: false },
    ],
  )
  assert.ok(survivors.every((item) => item.completed === false))

  // Post-removal adds reuse the surviving max id and never collide with it.
  const next = list.add('start follow-up work')
  const maxId = Math.max(...survivors.map((item) => item.id))
  assert.equal(typeof next.id, 'number')
  assert.ok(next.id > maxId)
  assert.ok(
    list.list().filter((item) => item.id === next.id).length === 1,
    'new id must be unique among living items',
  )
})
