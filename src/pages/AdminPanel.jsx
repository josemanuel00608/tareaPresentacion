import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './AdminPanel.css';

function AdminPanel() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkRole();
    }
  }, [user]);

  async function checkRole() {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserRole(data.role);
      if (data.role === 'admin') {
        fetchAdminData();
      }
    }
    setLoading(false);
  }

  async function fetchAdminData() {
    const [coursesResult, usersResult] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('*, user_roles(role)')
    ]);

    if (coursesResult.data) setCourses(coursesResult.data);
    if (usersResult.data) setUsers(usersResult.data);
  }

  async function assignRole(userId, role) {
    const { error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);

    if (!error) {
      alert('Rol actualizado correctamente');
      fetchAdminData();
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  if (userRole !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="container">
          <div className="access-denied">
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder al panel de administración.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <h1>Panel de Administración</h1>

        <section className="admin-section">
          <h2>Gestión de Cursos ({courses.length})</h2>
          <div className="admin-table">
            {courses.map(course => (
              <div key={course.id} className="admin-row">
                <div className="admin-cell">
                  <h4>{course.title}</h4>
                  <p>{course.students_count} estudiantes</p>
                </div>
                <div className="admin-actions">
                  <span className={`badge ${course.is_published ? 'published' : 'draft'}`}>
                    {course.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2>Gestión de Usuarios ({users.length})</h2>
          <div className="admin-table">
            {users.map(u => (
              <div key={u.id} className="admin-row">
                <div className="admin-cell">
                  <h4>{u.full_name || u.email}</h4>
                  <p>{u.email}</p>
                </div>
                <div className="admin-actions">
                  <select
                    value={u.user_roles?.role || 'student'}
                    onChange={(e) => assignRole(u.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="student">Estudiante</option>
                    <option value="teacher">Profesor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
