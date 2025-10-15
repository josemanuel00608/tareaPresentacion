import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      const [enrollmentsResult, purchasesResult, activityResult] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            courses (
              id,
              title,
              thumbnail_url,
              duration_hours
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('purchases')
          .select(`
            *,
            courses (
              id,
              title,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (enrollmentsResult.data) setEnrollments(enrollmentsResult.data);
      if (purchasesResult.data) setPurchases(purchasesResult.data);
      if (activityResult.data) setActivity(activityResult.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="not-logged-in">
            <h2>Por favor, inicia sesión</h2>
            <p>Necesitas iniciar sesión para ver tu dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Mi Dashboard</h1>
          <p>Bienvenido de nuevo, {user.email}</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{enrollments.length}</h3>
              <p>Cursos Activos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{enrollments.filter(e => e.completed).length}</h3>
              <p>Cursos Completados</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{purchases.length}</h3>
              <p>Compras Totales</p>
            </div>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Mis Cursos</h2>
          {enrollments.length > 0 ? (
            <div className="courses-list">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="course-item">
                  <img
                    src={enrollment.courses.thumbnail_url}
                    alt={enrollment.courses.title}
                    className="course-thumb"
                  />
                  <div className="course-info">
                    <h3>{enrollment.courses.title}</h3>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <p className="progress-text">{enrollment.progress}% completado</p>
                  </div>
                  <Link to={`/course/${enrollment.courses.id}`} className="btn-continue">
                    Continuar
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tienes cursos activos.</p>
              <Link to="/" className="btn-browse">Explorar Cursos</Link>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Historial de Compras</h2>
          {purchases.length > 0 ? (
            <div className="purchases-list">
              {purchases.map(purchase => (
                <div key={purchase.id} className="purchase-item">
                  <div className="purchase-info">
                    <h4>{purchase.courses?.title}</h4>
                    <p className="purchase-date">
                      {new Date(purchase.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="purchase-status">
                    <span className={`status-badge ${purchase.payment_status}`}>
                      {purchase.payment_status === 'pending' && 'Pendiente'}
                      {purchase.payment_status === 'verified' && 'Verificado'}
                      {purchase.payment_status === 'completed' && 'Completado'}
                      {purchase.payment_status === 'failed' && 'Fallido'}
                    </span>
                    <span className="purchase-amount">${purchase.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tienes compras registradas.</p>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Actividad Reciente</h2>
          {activity.length > 0 ? (
            <div className="activity-list">
              {activity.map(item => (
                <div key={item.id} className="activity-item">
                  <span className="activity-icon">
                    {item.activity_type === 'view' && '👁️'}
                    {item.activity_type === 'complete' && '✅'}
                    {item.activity_type === 'download' && '⬇️'}
                  </span>
                  <span className="activity-text">
                    {item.activity_type === 'view' && 'Viste un curso'}
                    {item.activity_type === 'complete' && 'Completaste una lección'}
                    {item.activity_type === 'download' && 'Descargaste material'}
                  </span>
                  <span className="activity-time">
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay actividad reciente.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
