// frontend/src/api/todos.ts
import {api} from './http'

export interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchTodos(): Promise<Todo[]> {
  const {data} = await api.get<Todo[]>('/todos')
  return data
}

export async function createTodo(title: string): Promise<Todo> {
  const {data} = await api.post<Todo>('/todos', {title})
  return data
}

export async function updateTodo(
  id: number,
  payload: Partial<Pick<Todo, 'title' | 'completed'>>,
): Promise<Todo> {
  const {data} = await api.patch<Todo>(`/todos/${id}`, payload)
  return data
}

export async function toggleTodo(id: number): Promise<Todo> {
  const {data} = await api.patch<Todo>(`/todos/${id}/toggle`)
  return data
}

export async function deleteTodo(id: number): Promise<void> {
  await api.delete(`/todos/${id}`)
}
