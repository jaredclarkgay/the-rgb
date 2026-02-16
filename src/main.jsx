import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ScenarioProvider } from './systems/scenarioState.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ScenarioProvider>
      <App />
    </ScenarioProvider>
  </StrictMode>,
)
