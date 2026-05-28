import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

// 1. Setup the regular HTTP link for Queries and Mutations
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_HTTP,
  headers: {
    'x-hasura-role': import.meta.env.VITE_HASURA_ROLE,
  },
})

// 2. Setup the WebSocket link for real-time Subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS,
    connectionParams: async () => ({
      headers: {
        'x-hasura-role': import.meta.env.VITE_HASURA_ROLE,
      },
    }),
  }),
)

// 3. Split traffic: Send subscriptions to WebSockets, everything else to HTTP
const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  httpLink,
)

// 4. Create and export the Apollo Client instance
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(), // Automatically caches data to make your app faster
})