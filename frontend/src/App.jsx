import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PublicQueue from './pages/PublicQueue'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import SavedEvents from './pages/SavedEvents'
import SongList from './pages/SongList'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Schermata pubblica per i cantanti */}
          <Route path="/" element={<PublicQueue />} />

          {/* Lista canzoni pubblica - permette ai cantanti di cercare e selezionare canzoni */}
          <Route path="/canzoni" element={<SongList isPublic={true} />} />

          {/* Area admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/songlist" element={<SongList />} />
          <Route path="/admin/serate" element={<SavedEvents />} />

          {/* Redirect /admin a /admin/login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* 404 - Redirect alla home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
