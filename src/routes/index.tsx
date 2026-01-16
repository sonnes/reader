import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  // Redirect to the main reading experience
  return <Navigate to="/read" />
}
