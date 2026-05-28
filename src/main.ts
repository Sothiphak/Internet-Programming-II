import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import { apolloClient } from './apollo/client'
import './style.css' // Keeps the default Vite styling

const app = createApp({
  setup() {
    // This makes Apollo available to all your Vue components
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

// Tell Vue to use Pinia for managing application data
app.use(createPinia())

// Mount the app to the webpage
app.mount('#app')