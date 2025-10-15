import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import CategoryPage from './pages/CategoryPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TeacherPanel from './pages/TeacherPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/teacher" element={<TeacherPanel />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
