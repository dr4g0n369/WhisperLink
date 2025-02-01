import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from './Pages/Dashboard'
import Dashboard0 from './Pages/Dashboard0'
import Home from './Pages/Home'
import './App.css'
import Connect from './Pages/Connect'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard0" element={<Dashboard0 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connect" element={<Connect />} />
      </Routes>
    </Router>
  )
}

export default App
