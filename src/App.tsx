import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/auth'
import {
  Landing,
  AuthCallback,
  Dashboard,
  AdminDashboard,
  Day1,
  Day2,
  Day3,
  Day4,
  Day5,
  Day6,
  Day7,
  Day8,
  Day9,
  Day10,
  Day11,
  Day12,
  Day13,
  Day14,
  MandaratEdit,
} from './pages'

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

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Day Routes - 13 Steps + Day 14 for future */}
        <Route
          path="/step/1"
          element={
            <ProtectedRoute>
              <Day1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/2"
          element={
            <ProtectedRoute>
              <Day2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/3"
          element={
            <ProtectedRoute>
              <Day3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/4"
          element={
            <ProtectedRoute>
              <Day4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/5"
          element={
            <ProtectedRoute>
              <Day5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/6"
          element={
            <ProtectedRoute>
              <Day6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/7"
          element={
            <ProtectedRoute>
              <Day7 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/8"
          element={
            <ProtectedRoute>
              <Day8 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/9"
          element={
            <ProtectedRoute>
              <Day9 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/10"
          element={
            <ProtectedRoute>
              <Day10 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/11"
          element={
            <ProtectedRoute>
              <Day11 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/12"
          element={
            <ProtectedRoute>
              <Day12 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/13"
          element={
            <ProtectedRoute>
              <Day13 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/step/14"
          element={
            <ProtectedRoute>
              <Day14 />
            </ProtectedRoute>
          }
        />

        {/* Mandarat Edit */}
        <Route
          path="/mandala/edit"
          element={
            <ProtectedRoute>
              <MandaratEdit />
            </ProtectedRoute>
          }
        />

        {/* Other day routes (will be implemented) */}
        <Route
          path="/step/:day"
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

