/**
 * Deliberately dependency-free TodoList domain used by the W8 Golden Project.
 * The real task may add a traceable buildVersion field without changing the
 * storage model or introducing dependencies.
 */

export const buildVersion = '0.1.0'

export function createTodoList(initial = []) {
  const items = initial.map(normalize)

  return {
    add(title) {
      const item = normalize({ id: nextId(items), title, completed: false })
      items.push(item)
      return { ...item }
    },
    complete(id) {
      const item = items.find((entry) => entry.id === id)
      if (!item) return null
      item.completed = true
      return { ...item }
    },
    remove(id) {
      const index = items.findIndex((entry) => entry.id === id)
      if (index === -1) return null
      const [item] = items.splice(index, 1)
      return { ...item }
    },
    list() {
      return items.map((item) => ({ ...item }))
    },
    version() {
      return buildVersion
    },
  }
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function normalize(item) {
  if (!item || typeof item !== 'object') throw new TypeError('todo must be an object')
  const title = typeof item.title === 'string' ? item.title.trim() : ''
  if (!title) throw new TypeError('todo title must be non-empty')
  return {
    id: Number(item.id),
    title,
    completed: Boolean(item.completed),
  }
}
