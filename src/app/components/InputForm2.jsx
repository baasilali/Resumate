import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function InputForm2({ setProgress, progress, onComplete }) {
  const [courses, setCourses] = useState([]);
  const [courseInput, setCourseInput] = useState('');
  const [errors, setErrors] = useState({});
  
  const suggestedCourses = [
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Operating Systems',
    'Software Engineering',
    'Computer Networks',
    'Artificial Intelligence',
    'Machine Learning',
    'Web Development',
    'Mobile App Development'
  ];

  useEffect(() => {
    updateProgress();
  }, [courses, updateProgress]);

  const handleCourseChange = (e) => {
    setCourseInput(e.target.value);
  };

  const addCourse = (course) => {
    if (course && !courses.includes(course)) {
      setCourses([...courses, course]);
    }
    setCourseInput('');
  };

  const removeCourse = (indexToRemove) => {
    const newCourses = courses.filter((_, index) => index !== indexToRemove);
    setCourses(newCourses);
  };

  const updateProgress = () => {
    const initialProgress = 25; // Initial progress before starting InputForm2
    const courseCount = courses.length;
    const additionalProgress = Math.min((courseCount / 4) * 25, 25); // Additional progress up to 25%
    setProgress(initialProgress + additionalProgress);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (courses.length < 4) newErrors.courses = 'At least four courses are required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      const formData = {
        courses,
      };
      console.log('Courses Form Data:', JSON.stringify(formData, null, 2));
      onComplete(); // Transition to the next form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-white w-96 shadow-xl max-h-[70vh] overflow-y-auto">
      <div className="card-body">
        <label className={`input input-bordered flex items-center gap-2 ${errors.courses ? 'border-red-500' : ''}`}>
          <input
            type="text"
            className={`grow text-black ${errors.courses ? 'border-red-500' : ''}`}
            placeholder="Add a course"
            value={courseInput}
            onChange={handleCourseChange}
          />
          <button type="button" onClick={() => addCourse(courseInput)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add
          </button>
        </label>
        {errors.courses && (
          <div className="text-red-500 mt-2">{errors.courses}</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {courses.filter(course => course).map((course, index) => (
            <div key={index} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full flex items-center">
              <span>{course}</span>
              <button
                type="button"
                onClick={() => removeCourse(index)}
                className="ml-2 text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Suggested Courses</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestedCourses.map((course, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addCourse(course)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200"
              >
                {course}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="bg-green-500 text-white mt-4 px-4 py-2 rounded">
          Submit
        </button>
      </div>
    </form>
  );
}

InputForm2.propTypes = {
  setProgress: PropTypes.func.isRequired,
  progress: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
};
