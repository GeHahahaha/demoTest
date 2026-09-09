# `removeCompleted()` 说明

`createTodoList()` 返回的列表对象新增了第 5 个方法 `removeCompleted()`。它的行为是：

- 无参调用，签名固定为 `() => number`。
- 从列表内部状态中**原地删除**所有 `completed === true` 的待办项。
- 保留所有未完成项，且**未完成项之间的相对先后顺序不变**，字段值（`id` / `title` / `completed`）逐字保留。
- 返回**被删除的条数**（整型）。若列表为空或本就没有 `completed === true` 的项，返回 `0` 且列表内容与顺序均不变。

## 调用示例

```js
import { createTodoList } from '../src/todo.mjs'

const list = createTodoList()
list.add('write report')
list.add('file taxes') // id 2
list.complete(2)

const removed = list.removeCompleted() // removed === 1
list.list() // => [{ id: 1, title: 'write report', completed: false }]
```

## 返回值与顺序保证

- 返回值为删除前项数减去删除后项数，即被原地过滤去除的项数。
- 未完成项保持原有相对顺序：例如存活未完成项原本依次为 `a`、`d`，删除中间的 `completed: true` 项后，结果顺序仍为 `a`、`d`，不会倒序或乱序。
- 初始构造时若 `initial` 中携带 `completed: true` 的项（`normalize` 已用 `Boolean()` 归一化），这些项同样会被删除并计入返回值。

## 与其他方法的关系

- `removeCompleted()` 仅作用在闭包内的内部状态（`items`）上，采用与 `add`/`complete` 一致的**原地变更模型**，不会把 `createTodoList` 改造成函数式不可变重绑。
- `list()` 每次返回新数组、`add`/`complete` 返回元素浅拷贝，因此外部长期持有的历史快照不受本次删除影响，无需同步外部引用。
- `version()` / `add` / `complete` / `list` 的既有行为不变。删除最大 `id` 的项后，后续 `add` 的 `id` 仍沿用既有 `max(id) + 1` 惰性分配语义，从存活项的最大 `id` 继续，不保证主键连续递增（属既有 `add` 语义，不在本方法职责内更改）。
