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

test('update is a callable member and returns a shallow-copy snapshot', () => {
  const list = createTodoList([{ id: 5, title: 'a', completed: false }])
  assert.equal(typeof list.update, 'function')
  const result = list.update(5, { title: 'b' })
  assert.deepEqual(result, { id: 5, title: 'b', completed: false })
})

test('update changes only the fields provided in the patch', () => {
  const list = createTodoList([{ id: 1, title: 'one', completed: false }])
  // Only completed provided.
  assert.deepEqual(list.update(1, { completed: true }), {
    id: 1,
    title: 'one',
    completed: true,
  })
  assert.deepEqual(list.list(), [{ id: 1, title: 'one', completed: true }])
  // Only title provided.
  assert.deepEqual(list.update(1, { title: '  two  ' }), {
    id: 1,
    title: 'two',
    completed: true,
  })
  // Both provided at once.
  assert.deepEqual(list.update(1, { title: 'three', completed: false }), {
    id: 1,
    title: 'three',
    completed: false,
  })
  assert.deepEqual(list.list(), [{ id: 1, title: 'three', completed: false }])
})

test('update leaves fields absent from the patch unchanged', () => {
  const list = createTodoList([{ id: 7, title: 'keep me', completed: true }])
  const result = list.update(7, { completed: false })
  // title was not in the patch and must survive untouched.
  assert.equal(list.list()[0].title, 'keep me')
  assert.deepEqual(list.list(), [
    { id: 7, title: 'keep me', completed: false },
  ])
  assert.equal(result.title, 'keep me')
})

test('update a non-first item leaves sibling entries untouched', () => {
  const list = createTodoList([
    { id: 1, title: 'first', completed: false },
    { id: 2, title: 'second', completed: false },
    { id: 3, title: 'third', completed: false },
  ])
  list.update(2, { completed: true })
  assert.deepEqual(list.list(), [
    { id: 1, title: 'first', completed: false },
    { id: 2, title: 'second', completed: true },
    { id: 3, title: 'third', completed: false },
  ])
})

test('update returns a shallow copy that cannot alias-list mutations', () => {
  const list = createTodoList([{ id: 4, title: 'snapshot', completed: false }])
  const snapshot = list.update(4, { title: 'snapshot2' })
  snapshot.title = 'mutated!'
  snapshot.completed = true
  // Mutating the returned snapshot must not bleed into the stored state.
  assert.deepEqual(list.list(), [{ id: 4, title: 'snapshot2', completed: false }])
})

test('update with an unknown id returns null and leaves the list unchanged', () => {
  const baseline = [{ id: 8, title: 'present', completed: false }]
  const list = createTodoList(baseline)
  assert.equal(list.update(999, { title: 'x' }), null)
  assert.deepEqual(list.list(), baseline)
  assert.equal(list.list().length, 1)
})

test('update ignores unknown extension keys in the patch', () => {
  const list = createTodoList([{ id: 9, title: 'orig', completed: false }])
  const result = list.update(9, { title: 'next', completed: true, foo: 'bar' })
  assert.deepEqual(result, { id: 9, title: 'next', completed: true })
  assert.deepEqual(list.list(), [{ id: 9, title: 'next', completed: true }])
})

test('update throws type errors for invalid titles without side effects', () => {
  const baseline = [{ id: 6, title: 'stable', completed: false }]
  const list = createTodoList(baseline)
  assert.throws(() => list.update(6, { title: '   ' }), TypeError)
  assert.throws(() => list.update(6, { title: 123 }), TypeError)
  assert.throws(() => list.update(6, null), TypeError)
  // Invalid input must not mutate the stored list at all.
  assert.deepEqual(list.list(), baseline)
  // A later valid update still works.
  assert.deepEqual(list.update(6, { title: 'ok' }), {
    id: 6,
    title: 'ok',
    completed: false,
  })
})

test('update matches integer ids strictly like complete', () => {
  const list = createTodoList([{ id: 3, title: 'run doctor', completed: false }])
  // update('3') must not match integer id 3 (strict equality, no type
  // coercion), so it returns null with zero effects — same as complete('3').
  assert.equal(list.update('3', { title: 'should not hit' }), null)
  assert.equal(list.complete('3'), null)
  assert.deepEqual(list.list(), [{ id: 3, title: 'run doctor', completed: false }])
})

test('update accepts a non-object patch only after locating the id', () => {
  const list = createTodoList([{ id: 11, title: 'live', completed: false }])
  // patch evaluated lazily: null patch on an unknown id is a clean null return.
  assert.equal(list.update(404, null), null)
  // null patch on an existing id is a type error.
  assert.throws(() => list.update(11, null), TypeError)
})
