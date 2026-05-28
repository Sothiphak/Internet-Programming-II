import { gql } from '@apollo/client/core'

// 1. Read all todos (sorted by newest first)
export const GET_TODOS = gql`
  query GetTodos {
    todos(order_by: { created_at: desc }) {
      id
      title
      is_done
      created_at
    }
  }
`

// 2. Add a single new todo
export const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    insert_todos_one(object: { title: $title }) {
      id
      title
      is_done
      created_at
    }
  }
`

// 3. Check or uncheck a todo item
export const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: uuid!, $done: Boolean!) {
    update_todos_by_pk(pk_columns: { id: $id }, _set: { is_done: $done }) {
      id
      is_done
    }
  }
`

// 4. Delete a todo item completely
export const DELETE_TODO = gql`
  mutation DeleteTodo($id: uuid!) {
    delete_todos_by_pk(id: $id) {
      id
    }
  }
`

// 5. Watch for real-time changes automatically
export const TODOS_SUB = gql`
  subscription TodosSub {
    todos(order_by: { created_at: desc }) {
      id
      title
      is_done
      created_at
    }
  }
`