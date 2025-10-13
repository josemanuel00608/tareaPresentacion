import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';
import './CoursePage.css';

function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();

  const handleEnrollClick = () => {
    if (!user) {
      alert('Por favor, inicia sesión para comprar este curso.');
      return;
    }
    setShowPaymentModal(true);
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  async function fetchCourse() {
    try {
      const [courseResult, lessonsResult] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            instructors (
              id,
              name,
              bio,
              avatar_url
            ),
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index')
      ]);

      if (courseResult.data) setCourse(courseResult.data);
      if (lessonsResult.data) setLessons(lessonsResult.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando curso...</div>;
  }

  if (!course) {
    return <div className="error">Curso no encontrado</div>;
  }

  return (
    <div className="course-page">
      <div className="course-hero" style={{ backgroundImage: `url(${course.thumbnail_url})` }}>
        <div className="course-hero-overlay">
          <div className="container">
            <div className="course-hero-content">
              <div className="course-category">{course.categories?.name}</div>
              <h1 className="course-hero-title">{course.title}</h1>
              <p className="course-hero-description">{course.short_description}</p>
              <div className="course-hero-meta">
                <div className="meta-item">
                  <span className="star">⭐</span>
                  <span className="rating">{course.rating}</span>
                  <span className="students">({course.students_count.toLocaleString()} estudiantes)</span>
                </div>
                <div className="meta-item">
                  <span className="icon">🕒</span>
                  <span>{course.duration_hours} horas</span>
                </div>
                <div className="meta-item">
                  <span className="icon">📊</span>
                  <span className="level">{course.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content-wrapper">
        <div className="container">
          <div className="course-layout">
            <div className="course-main">
              <section className="course-section">
                <h2>Descripción del Curso</h2>
                <p className="course-full-description">{course.description}</p>
              </section>

              <section className="course-section">
                <h2>Lo que Aprenderás</h2>
                <div className="learning-objectives">
                  <div className="objective">
                    <span className="check">✓</span>
                    <span>Dominar los conceptos fundamentales desde cero</span>
                  </div>
                  <div className="objective">
                    <span className="check">✓</span>
                    <span>Desarrollar proyectos prácticos del mundo real</span>
                  </div>
                  <div className="objective">
                    <span className="check">✓</span>
                    <span>Aplicar las mejores prácticas de la industria</span>
                  </div>
                  <div className="objective">
                    <span className="check">✓</span>
                    <span>Obtener certificado al completar el curso</span>
                  </div>
                </div>
              </section>

              <section className="course-section">
                <h2>Instructor</h2>
                <div className="instructor-info">
                  <img src={course.instructors?.avatar_url} alt={course.instructors?.name} className="instructor-photo" />
                  <div className="instructor-details">
                    <h3>{course.instructors?.name}</h3>
                    <p>{course.instructors?.bio}</p>
                  </div>
                </div>
              </section>

              {lessons.length > 0 && (
                <section className="course-section">
                  <h2>Contenido del Curso</h2>
                  <div className="lessons-list">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="lesson-item">
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-info">
                          <h4>{lesson.title}</h4>
                          <p>{lesson.description}</p>
                        </div>
                        <div className="lesson-duration">{lesson.duration_minutes} min</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="course-sidebar">
              <div className="purchase-card">
                <div className="price-tag">
                  <span className="price">${course.price.toLocaleString()}</span>
                </div>
                <button className="btn-enroll" onClick={handleEnrollClick}>Inscribirse Ahora</button>
                <button className="btn-demo">Vista Previa</button>
                <div className="course-includes">
                  <h4>Este curso incluye:</h4>
                  <ul>
                    <li>
                      <span className="icon">🎥</span>
                      <span>{course.duration_hours} horas de video</span>
                    </li>
                    <li>
                      <span className="icon">📄</span>
                      <span>Recursos descargables</span>
                    </li>
                    <li>
                      <span className="icon">♾️</span>
                      <span>Acceso de por vida</span>
                    </li>
                    <li>
                      <span className="icon">📱</span>
                      <span>Acceso desde móvil y TV</span>
                    </li>
                    <li>
                      <span className="icon">📜</span>
                      <span>Certificado de finalización</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={course}
        />
      )}
    </div>
  );
}

export default CoursePage;
