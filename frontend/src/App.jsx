// Main App component with routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CourseList = lazy(() => import('./pages/CourseList'));
const CourseDetails = lazy(() => import('./pages/CourseDetails'));
const CourseEdit = lazy(() => import('./pages/CourseEdit'));
const Navbar = lazy(() => import('./components/Navbar'));

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/student-dashboard" />;
  }

  return children;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference) {
      setIsDarkMode(JSON.parse(darkModePreference));
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Suspense fallback={<LoadingPage />}>
          <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/course/:id" element={<CourseDetails />} />

            {/* Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/instructor-dashboard"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/instructor/course/:id/edit"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <CourseEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/courses" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
