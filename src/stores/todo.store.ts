import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '../apollo/client'
import { GET_TODOS, ADD_TODO, TOGGLE_TODO, DELETE_TODO, TODOS_SUB } from '../graphql/todos'

export type Todo = {
  id: string
  title: string
  is_done: boolean
  created_at: string
}

export const useTodoStore = defineStore('todo', () => {
  // --- STATE ---
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentFilter = ref<'all' | 'active' | 'completed'>('all')

  // --- COMPUTED PROPERTIES (Filtering) ---
  const filteredTodos = computed(() => {
    if (currentFilter.value === 'active') {
      return todos.value.filter((t) => !t.is_done)
    }
    if (currentFilter.value === 'completed') {
      return todos.value.filter((t) => t.is_done)
    }
    return todos.value
  })

  const activeCount = computed(() => {
    return todos.value.filter((t) => !t.is_done).length
  })

  // --- ACTIONS ---
  
  // Fetch initial list
  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const { data } = await apolloClient.query<{ todos: Todo[] }>({
        query: GET_TODOS,
        fetchPolicy: 'network-only',
      })
      todos.value = data.todos
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load todos'
    } finally {
      loading.value = false
    }
  }

  // Optimistic Add: Show a placeholder item immediately
  async function addTodo(title: string) {
    const clean = title.trim()
    if (!clean) return

    // Create a temporary local item so the UI updates instantly
    const tempId = `temp-${Date.now()}`
    const tempTodo: Todo = {
      id: tempId,
      title: clean,
      is_done: false,
      created_at: new Date().toISOString(),
    }
    
    // Put it at the top of the list immediately
    todos.value = [tempTodo, ...todos.value]

    try {
      await apolloClient.mutate({
        mutation: ADD_TODO,
        variables: { title: clean },
      })
      // The real-time subscription will automatically replace the temp item with the database version
    } catch (e) {
      // Rollback on network failure
      todos.value = todos.value.filter((t) => t.id !== tempId)
      console.error('Failed to save item to database:', e)
    }
  }

  // Optimistic Toggle: Flip the checkbox instantly on screen
  async function toggleTodo(todo: Todo) {
    const target = todos.value.find((t) => t.id === todo.id)
    if (!target) return

    // Flip it locally before the API call finishes
    const oldStatus = target.is_done
    target.is_done = !target.is_done

    try {
      await apolloClient.mutate({
        mutation: TOGGLE_TODO,
        variables: { id: todo.id, done: target.is_done },
      })
    } catch (e) {
      // Rollback if the database update fails
      target.is_done = oldStatus
      console.error('Failed to sync toggle status:', e)
    }
  }

  // Optimistic Delete: Remove it from the screen immediately
  async function deleteTodo(id: string) {
    const backupIndex = todos.value.findIndex((t) => t.id === id)
    if (backupIndex === -1) return
    
    const backupTodo = todos.value[backupIndex]

    // Remove locally right away
    todos.value = todos.value.filter((t) => t.id !== id)

    try {
      await apolloClient.mutate({
        mutation: DELETE_TODO,
        variables: { id },
      })
    } catch (e) {
      // Put it back if the database delete failed
      todos.value.splice(backupIndex, 0, backupTodo)
      console.error('Failed to delete item from database:', e)
    }
  }

  // Real-time subscription stream
  // Real-time subscription stream (Fixed Version)
  function startRealtime() {
    const obs = apolloClient.subscribe<{ todos: Todo[] }>({
      query: TODOS_SUB,
    })

    const sub = obs.subscribe({
      next: ({ data }) => {
        if (data?.todos) {
          // 1. Look at our temporary items, but DROP them if the server has now sent back an item with the exact same title
          const remainingTempItems = todos.value.filter((localItem) => 
            localItem.id.startsWith('temp-') && 
            !data.todos.some((serverItem) => serverItem.title === localItem.title)
          )

          // 2. Combine any active "still-saving" temp items with the official server list
          todos.value = [...remainingTempItems, ...data.todos]
        }
      },
      error: (e) => console.error('Subscription error:', e),
    })

    return () => sub.unsubscribe()
  }

  return {
    todos,
    loading,
    error,
    currentFilter,
    filteredTodos,
    activeCount,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    startRealtime,
  }
})