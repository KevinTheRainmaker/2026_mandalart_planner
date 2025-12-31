import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/auth'
import { Landing, AuthCallback, Dashboard, Day1, Day2, Day3 } from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Day Routes */}
        <Route
          path="/day/1"
          element={
            <ProtectedRoute>
              <Day1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day/2"
          element={
            <ProtectedRoute>
              <Day2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day/3"
          element={
            <ProtectedRoute>
              <Day3 />
            </ProtectedRoute>
          }
        />

        {/* Other day routes (will be implemented) */}
        <Route
          path="/day/:day"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Day 페이지
                  </h2>
                  <p className="text-gray-600">곧 구현됩니다</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
