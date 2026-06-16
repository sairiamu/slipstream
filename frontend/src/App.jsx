import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StudentSearch from './pages/StudentSearch'
import AdminPanel from './pages/AdminPanel'
import PWAHandler from './components/PWAHandler'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <PWAHandler />
        <Routes>
          <Route path="/" element={<StudentSearch />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
