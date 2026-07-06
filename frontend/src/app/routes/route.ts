import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AgentWorkspacePage } from '../AgentWorkspacePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(AgentWorkspacePage),
  },
])
