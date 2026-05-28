<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useTodoStore } from './stores/todo.store'

const todoStore = useTodoStore()
const title = ref('')
let stopRealtime: null | (() => void) = null

onMounted(async () => {
  await todoStore.fetchTodos()
  stopRealtime = todoStore.startRealtime()
})

onBeforeUnmount(() => {
  stopRealtime?.()
})

function onAdd() {
  if (!title.value.trim()) return
  todoStore.addTodo(title.value)
  title.value = ''
}
</script>

<template>
  <div class="todo-app">
    <h1>GraphQL To-Do Pro</h1>

    <form @submit.prevent="onAdd" class="todo-form">
      <input 
        v-model="title" 
        type="text" 
        placeholder="What needs to be done?" 
        required 
      />
      <button type="submit">Add Item</button>
    </form>

    <div class="filter-tabs">
      <button 
        :class="{ active: todoStore.currentFilter === 'all' }" 
        @click="todoStore.currentFilter = 'all'"
      >
        All
      </button>
      <button 
        :class="{ active: todoStore.currentFilter === 'active' }" 
        @click="todoStore.currentFilter = 'active'"
      >
        Active
      </button>
      <button 
        :class="{ active: todoStore.currentFilter === 'completed' }" 
        @click="todoStore.currentFilter = 'completed'"
      >
        Completed
      </button>
    </div>

    <div v-if="todoStore.loading && todoStore.todos.length === 0" class="status loading">
      Connecting to Neon DB...
    </div>
    <div v-if="todoStore.error" class="status error">{{ todoStore.error }}</div>

    <ul v-else class="todo-list">
      <li 
        v-for="todo in todoStore.filteredTodos" 
        :key="todo.id" 
        :class="{ completed: todo.is_done, optimistic: todo.id.startsWith('temp-') }"
      >
        <label class="todo-content">
          <input 
            type="checkbox" 
            :checked="todo.is_done" 
            :disabled="todo.id.startsWith('temp-')"
            @change="todoStore.toggleTodo(todo)" 
          />
          <span>{{ todo.title }}</span>
          <small v-if="todo.id.startsWith('temp-')" class="saving-tag">Saving...</small>
        </label>
        
        <button @click="todoStore.deleteTodo(todo.id)" class="delete-btn">
          Delete
        </button>
      </li>
    </ul>

    <div class="todo-footer">
      <span>{{ todoStore.activeCount }} items left</span>
      <span>Status: 🟢 Connected</span>
    </div>
  </div>
</template>

<style scoped>
.todo-app {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background: #1e1e1e;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #e0e0e0;
}

h1 {
  text-align: center;
  color: #4fc08d;
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 28px; 
  line-height: 1.4; 
  letter-spacing: 0.5px;
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

input[type="text"] {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #2a2a2a;
  color: white;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  border-color: #4fc08d;
}

.filter-tabs {
  display: flex;
  background: #111;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
}

.filter-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: #888;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  font-weight: normal;
  transition: all 0.2s;
}

.filter-tabs button.active {
  background: #2a2a2a;
  color: #4fc08d;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.status {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.loading { background: #2c2505; color: #fbc02d; }
.error { background: #2c0505; color: #ef5350; }

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #252525;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #4fc08d;
  transition: all 0.2s ease;
}

li.completed {
  border-left-color: #555;
  opacity: 0.5;
}

li.completed span {
  text-decoration: line-through;
  color: #888;
}

li.optimistic {
  border-left-color: #fbc02d;
  background: #2a281e;
}

.saving-tag {
  color: #fbc02d;
  font-size: 11px;
  margin-left: 8px;
  font-style: italic;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #4fc08d;
  cursor: pointer;
}

.delete-btn {
  background: transparent;
  color: #888;
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #333;
  border-radius: 6px;
}

.delete-btn:hover {
  background-color: #ef5350;
  color: white;
  border-color: #ef5350;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #2a2a2a;
}
</style>