import { Link } from 'react-router-dom';
import './CourseCard.css';

function CourseCard({ course }) {
  return (
    <Link to={`/course/${course.id}`} className="course-card">
      <div className="course-image-wrapper">
        <img src={course.thumbnail_url} alt={course.title} className="course-image" />
        <div className="course-level-badge">{course.level}</div>
      </div>
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.short_description}</p>
        <div className="course-instructor">
          <img src={course.instructors?.avatar_url} alt={course.instructors?.name} className="instructor-avatar" />
          <span className="instructor-name">{course.instructors?.name}</span>
        </div>
        <div className="course-meta">
          <div className="course-rating">
            <span className="star">⭐</span>
            <span className="rating-value">{course.rating}</span>
            <span className="students-count">({course.students_count.toLocaleString()} estudiantes)</span>
          </div>
          <div className="course-duration">
            <span className="duration-icon">🕒</span>
            <span>{course.duration_hours}h</span>
          </div>
        </div>
        <div className="course-footer">
          <span className="course-price">${course.price.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
