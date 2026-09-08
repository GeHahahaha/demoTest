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
    update(id, patch) {
      const index = items.findIndex((entry) => entry.id === id)
      if (index === -1) return null
      if (!patch || typeof patch !== 'object') {
        throw new TypeError('patch must be an object')
      }
      // Start from the current normalized entry and only override the fields
      // the caller actually provides via own-property checks.
      const current = items[index]
      let title = current.title
      let completed = current.completed
      if (Object.prototype.hasOwnProperty.call(patch, 'title')) title = patch.title
      if (Object.prototype.hasOwnProperty.call(patch, 'completed')) completed = patch.completed
      // Validate/normalize the candidate through the same contract used by
      // the rest of the module; this runs before any write so a TypeError
      // leaves the list untouched (atomicity).
      const updated = normalize({ id: current.id, title, completed })
      items[index] = updated
      return { ...updated }
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
