import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CourseCard from '../components/CourseCard';
import './HomePage.css';

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [coursesResult, categoriesResult] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            instructors (
              id,
              name,
              avatar_url
            ),
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('is_published', true)
          .order('students_count', { ascending: false })
          .limit(6),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (coursesResult.data) setCourses(coursesResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Aprende Sin Límites<br />
              <span className="hero-highlight">Tu Futuro Empieza Aquí</span>
            </h1>
            <p className="hero-subtitle">
              Accede a miles de cursos online impartidos por expertos de todo el mundo.
              Desarrolla nuevas habilidades a tu propio ritmo.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary">Explorar Cursos</button>
              <button className="btn-hero-secondary">Ver Demo</button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Cursos</div>
              </div>
              <div className="stat">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Estudiantes</div>
              </div>
              <div className="stat">
                <div className="stat-number">200+</div>
                <div className="stat-label">Instructores</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Explora por Categoría</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="category-card"
              >
                <div className="category-icon">📚</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cursos Populares</h2>
            <Link to="/courses" className="view-all">Ver todos →</Link>
          </div>
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">¿Por Qué Elegir Academia Online?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Aprende a Tu Ritmo</h3>
              <p>Accede a los cursos cuando quieras, desde cualquier dispositivo. Tu aprendizaje, tus horarios.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Expertos de Clase Mundial</h3>
              <p>Aprende de los mejores profesionales de la industria con años de experiencia.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Certificados Verificables</h3>
              <p>Obtén certificados al completar tus cursos que puedes compartir en LinkedIn.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Comunidad Activa</h3>
              <p>Conecta con miles de estudiantes y resuelve dudas en nuestros foros.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para Transformar Tu Carrera?</h2>
            <p>Únete a miles de estudiantes que ya están aprendiendo con nosotros</p>
            <button className="btn-cta">Comenzar Gratis</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
