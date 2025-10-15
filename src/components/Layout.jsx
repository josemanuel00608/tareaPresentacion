import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import ChatBot from './ChatBot';
import './Layout.css';

function Layout({ children }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  async function fetchUserRole() {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setUserRole(data.role);
  }

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link to="/" className="logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">Academia Online</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Inicio</Link>
              <Link to="/category/programacion" className="nav-link">Programación</Link>
              <Link to="/category/diseno" className="nav-link">Diseño</Link>
              <Link to="/category/negocios" className="nav-link">Negocios</Link>
              {user && <Link to="/dashboard" className="nav-link">Mi Dashboard</Link>}
              {userRole === 'teacher' && <Link to="/teacher" className="nav-link">Panel Profesor</Link>}
              {userRole === 'admin' && <Link to="/admin" className="nav-link">Panel Admin</Link>}
              <button className="btn-primary" onClick={handleAuthClick}>
                {user ? 'Cerrar Sesión' : 'Iniciar Sesión'}
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Academia Online</h3>
              <p>Aprende a tu ritmo con los mejores instructores del mundo.</p>
            </div>
            <div className="footer-section">
              <h4>Categorías</h4>
              <ul>
                <li><Link to="/category/programacion">Programación</Link></li>
                <li><Link to="/category/diseno">Diseño</Link></li>
                <li><Link to="/category/negocios">Negocios</Link></li>
                <li><Link to="/category/marketing">Marketing</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Soporte</h4>
              <ul>
                <li><a href="https://wa.me/59176082372" target="_blank" rel="noopener noreferrer">WhatsApp: +591 76082372</a></li>
                <li><a href="mailto:josemanuelloayzavaca7@gmail.com">Email: josemanuelloayzavaca7@gmail.com</a></li>
                <li><a href="tel:+59176082372">Llamar: +591 76082372</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Síguenos</h4>
              <ul>
                <li><a href="https://facebook.com/academiaonline" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://twitter.com/academiaonline" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                <li><a href="https://www.instagram.com/brakend0?igsh=MXZmZHVycGhmejNlYw==" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://linkedin.com/company/academiaonline" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Academia Online. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ChatBot />
    </div>
  );
}

export default Layout;
