import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const router = createBrowserRouter([
  { path: '/',     element: <App /> },   // shows AuthScreen first
  { path: '/app',  element: <App /> },   // after login
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)