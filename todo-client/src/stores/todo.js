import { defineStore } from "pinia";
import axios from "axios";

const API_URL = "http://localhost:3100/tasks";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
  }),
  getters: {
    countTodos: (state) => state.todos.filter((t) => t.completedAt == null).length,
  },
  actions: {
    // 1. Fetch from database instead of using dummy data
    async fetchTodos() {
      try {
        const response = await axios.get(API_URL);
        this.todos = response.data;
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    },
    
    // 2. Update the status in the database using the endpoints from your controller
    async toggleStatus(id) {
      const todo = this.todos.find((t) => t.id == id);
      if (todo) {
        try {
          const isCompleted = todo.completedAt != null;
          const endpoint = isCompleted ? `${API_URL}/${id}/pending` : `${API_URL}/${id}/done`;
          
          await axios.patch(endpoint);
          await this.fetchTodos(); // Refresh the list to grab the exact timestamp from the DB
        } catch (error) {
          console.error("Failed to toggle status:", error);
        }
      }
    },
    
    // 3. Send new tasks to the NestJS backend
    async addTodo(todoName) {
      try {
        await axios.post(API_URL, {
          name: todoName,
          description: "description",
        });
        await this.fetchTodos(); // Refresh to get the new task with its real database ID
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    },
    
    // 4. Delete tasks from the database
    async clearAll() {
      try {
        // Delete each task sequentially, then clear the local array
        for (const todo of this.todos) {
          await axios.delete(`${API_URL}/${todo.id}`);
        }
        this.todos = [];
      } catch (error) {
        console.error("Failed to clear todos:", error);
      }
    },
  },
});