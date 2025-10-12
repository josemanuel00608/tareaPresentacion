import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CourseCard from '../components/CourseCard';
import './CategoryPage.css';

function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndCourses();
  }, [slug]);

  async function fetchCategoryAndCourses() {
    try {
      const categoryResult = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (categoryResult.data) {
        setCategory(categoryResult.data);

        const coursesResult = await supabase
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
          .eq('category_id', categoryResult.data.id)
          .eq('is_published', true)
          .order('students_count', { ascending: false });

        if (coursesResult.data) setCourses(coursesResult.data);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!category) {
    return <div className="error">Categoría no encontrada</div>;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="container">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          <div className="category-stats">
            <span>{courses.length} cursos disponibles</span>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="category-content">
          {courses.length > 0 ? (
            <div className="courses-grid">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>No hay cursos disponibles en esta categoría.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
