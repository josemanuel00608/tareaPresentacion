import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './TeacherPanel.css';

function TeacherPanel() {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    material_type: 'video',
    file_url: '',
    is_preview: false
  });
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
      if (data.role === 'teacher' || data.role === 'admin') {
        fetchTeacherData();
      }
    }
    setLoading(false);
  }

  async function fetchTeacherData() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setCourses(data);
  }

  async function fetchMaterials(courseId) {
    const { data } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (data) setMaterials(data);
  }

  async function handleUploadMaterial(e) {
    e.preventDefault();

    const { error } = await supabase.from('course_materials').insert({
      ...newMaterial,
      course_id: selectedCourse,
      created_by: user.id
    });

    if (!error) {
      alert('Material subido correctamente');
      fetchMaterials(selectedCourse);
      setShowUploadForm(false);
      setNewMaterial({
        title: '',
        description: '',
        material_type: 'video',
        file_url: '',
        is_preview: false
      });
    }
  }

  if (loading) return <div className="loading">Cargando...</div>;

  if (userRole !== 'teacher' && userRole !== 'admin') {
    return (
      <div className="teacher-panel">
        <div className="container">
          <div className="access-denied">
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder al panel de profesores.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-panel">
      <div className="container">
        <h1>Panel de Profesores</h1>

        <section className="teacher-section">
          <h2>Mis Cursos</h2>
          <div className="courses-grid-teacher">
            {courses.map(course => (
              <div
                key={course.id}
                className={`course-card-teacher ${selectedCourse === course.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCourse(course.id);
                  fetchMaterials(course.id);
                }}
              >
                <h3>{course.title}</h3>
                <p>{course.students_count} estudiantes</p>
              </div>
            ))}
          </div>
        </section>

        {selectedCourse && (
          <section className="teacher-section">
            <div className="section-header">
              <h2>Material del Curso</h2>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="btn-add-material"
              >
                + Añadir Material
              </button>
            </div>

            {showUploadForm && (
              <form onSubmit={handleUploadMaterial} className="upload-form">
                <input
                  type="text"
                  placeholder="Título del material"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                />
                <select
                  value={newMaterial.material_type}
                  onChange={(e) => setNewMaterial({...newMaterial, material_type: e.target.value})}
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Documento</option>
                  <option value="link">Enlace</option>
                </select>
                <input
                  type="url"
                  placeholder="URL del archivo"
                  value={newMaterial.file_url}
                  onChange={(e) => setNewMaterial({...newMaterial, file_url: e.target.value})}
                  required
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newMaterial.is_preview}
                    onChange={(e) => setNewMaterial({...newMaterial, is_preview: e.target.checked})}
                  />
                  Disponible como vista previa
                </label>
                <button type="submit" className="btn-submit-material">Subir Material</button>
              </form>
            )}

            <div className="materials-list">
              {materials.map(material => (
                <div key={material.id} className="material-item">
                  <div className="material-icon">
                    {material.material_type === 'video' && '🎥'}
                    {material.material_type === 'pdf' && '📄'}
                    {material.material_type === 'document' && '📝'}
                    {material.material_type === 'link' && '🔗'}
                  </div>
                  <div className="material-info">
                    <h4>{material.title}</h4>
                    <p>{material.description}</p>
                    {material.is_preview && <span className="preview-badge">Vista previa</span>}
                  </div>
                  <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="btn-view">
                    Ver
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default TeacherPanel;
