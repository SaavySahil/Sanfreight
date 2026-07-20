import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Projects from './pages/Projects.jsx'
import ProjectForm from './pages/ProjectForm.jsx'
import Jobs from './pages/Jobs.jsx'
import JobForm from './pages/JobForm.jsx'
import Applications from './pages/Applications.jsx'
import Articles from './pages/Articles.jsx'
import ArticleForm from './pages/ArticleForm.jsx'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="applications" element={<Applications />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/new" element={<ArticleForm />} />
            <Route path="articles/:id/edit" element={<ArticleForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
