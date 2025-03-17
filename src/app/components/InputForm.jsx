import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function InputForm({ setProgress, progress, onComplete }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [extraLinks, setExtraLinks] = useState(['']);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const calculateProgress = () => {
      const totalFields = 5;
      let filledFields = 0;
      if (name) filledFields++;
      if (email) filledFields++;
      if (phone) filledFields++;
      if (university) filledFields++;
      if (linkedin) filledFields++;
      return (filledFields / totalFields) * 25;
    };
    setProgress(prevProgress => Math.max(prevProgress, calculateProgress()));
  }, [name, email, phone, university, linkedin, setProgress]);

  const handleExtraLinkChange = (e, index) => {
    const newExtraLinks = [...extraLinks];
    newExtraLinks[index] = e.target.value;
    setExtraLinks(newExtraLinks);
  };

  const addLinkLabel = () => {
    if (extraLinks.length < 3) {
      setExtraLinks([...extraLinks, '']);
    }
  };

  const removeLinkLabel = (indexToRemove) => {
    const newExtraLinks = extraLinks.filter((_, index) => index !== indexToRemove);
    setExtraLinks(newExtraLinks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (!university) newErrors.university = 'University is required';
    if (!linkedin) newErrors.linkedin = 'LinkedIn is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      const formData = {
        name,
        email,
        phone,
        university,
        linkedin,
        extraLinks,
      };
      console.log('Initial Form Data:', JSON.stringify(formData, null, 2));
      onComplete(); // Call the onComplete function to indicate form completion
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-white w-96 shadow-xl">
      <div className="card-body">
        <>
          <label className={`input input-bordered flex items-center gap-2 ${errors.name ? 'border-red-500' : ''}`}>
            <input
              type="text"
              className={`grow text-black ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={`input input-bordered flex items-center gap-2 ${errors.email ? 'border-red-500' : ''}`}>
            <input
              type="text"
              className={`grow text-black ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={`input input-bordered flex items-center gap-2 ${errors.phone ? 'border-red-500' : ''}`}>
            <input
              type="text"
              className={`grow text-black ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className={`input input-bordered flex items-center gap-2 ${errors.university ? 'border-red-500' : ''}`}>
            <input
              type="text"
              className={`grow text-black ${errors.university ? 'border-red-500' : ''}`}
              placeholder="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </label>
          <label className={`input input-bordered flex items-center gap-2 ${errors.linkedin ? 'border-red-500' : ''}`}>
            <input
              type="text"
              className={`grow text-black ${errors.linkedin ? 'border-red-500' : ''}`}
              placeholder="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </label>
          {extraLinks.map((link, index) => (
            <div key={index} className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow text-black"
                placeholder={`Extra Link ${index + 1}`}
                value={link}
                onChange={(e) => handleExtraLinkChange(e, index)}
              />
              <button
                type="button"
                onClick={() => removeLinkLabel(index)}
                className="text-red-500"
              >
                X
              </button>
            </div>
          ))}
          {extraLinks.length < 3 && (
            <button type="button" onClick={addLinkLabel} className="bg-blue-500 text-white mt-2 px-4 py-2 rounded">
              Add Link
            </button>
          )}
        </>
        <button type="submit" className="bg-green-500 text-white mt-2 px-4 py-2 rounded">
          Submit
        </button>
        {Object.keys(errors).length > 0 && (
          <div className="text-red-500 mt-2">Missing Fields</div>
        )}
      </div>
    </form>
  );
}

InputForm.propTypes = {
  setProgress: PropTypes.func.isRequired,
  progress: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
};
