import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function InputForm3({ setProgress, progress, onComplete }) {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    updateProgress();
  }, [jobTitle, description, updateProgress]);

  const updateProgress = () => {
    let filledFields = 0;
    if (jobTitle) filledFields++;
    if (description) filledFields++;
    const additionalProgress = (filledFields / 2) * 25; // Each field is worth 12.5% (up to an additional 25%)
    setProgress(progress => Math.min(progress + additionalProgress, 75)); // Total progress can go up to 75%
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!jobTitle) newErrors.jobTitle = 'Job title is required';
    if (!description) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      const formData = {
        jobTitle,
        description,
      };
      console.log('Job Form Data:', JSON.stringify(formData, null, 2));
      onComplete(); // Transition to the next form or finalize the process
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-white w-96 shadow-xl max-h-[70vh] overflow-y-auto">
      <div className="card-body">
        <label className={`input input-bordered flex items-center gap-2 ${errors.jobTitle ? 'border-red-500' : ''}`}>
          <input
            type="text"
            className={`grow text-black ${errors.jobTitle ? 'border-red-500' : ''}`}
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </label>
        {errors.jobTitle && <div className="text-red-500 mt-2">{errors.jobTitle}</div>}
        <label className={`input input-bordered flex items-center gap-2 mt-4 ${errors.description ? 'border-red-500' : ''}`}>
          <textarea
            className={`grow text-black ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Brief Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {errors.description && <div className="text-red-500 mt-2">{errors.description}</div>}
        <button type="submit" className="bg-green-500 text-white mt-4 px-4 py-2 rounded">
          Submit
        </button>
      </div>
    </form>
  );
}

InputForm3.propTypes = {
  setProgress: PropTypes.func.isRequired,
  progress: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
};
