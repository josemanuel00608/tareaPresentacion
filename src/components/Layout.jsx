import { Link } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
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
              <button className="btn-primary">Empezar Ahora</button>
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
                <li><a href="#ayuda">Centro de Ayuda</a></li>
                <li><a href="#contacto">Contacto</a></li>
                <li><a href="#terminos">Términos de Uso</a></li>
                <li><a href="#privacidad">Política de Privacidad</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Síguenos</h4>
              <ul>
                <li><a href="#facebook">Facebook</a></li>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#instagram">Instagram</a></li>
                <li><a href="#linkedin">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Academia Online. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
