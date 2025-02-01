import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserWeb3ContextProvider } from './context/web3context.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserWeb3ContextProvider>
    <App />
    </UserWeb3ContextProvider>
  </StrictMode>,
)
