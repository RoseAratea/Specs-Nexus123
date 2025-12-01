import React, { useState } from 'react';
import '../styles/ProfilePage.css';

const ProfileCard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    year: user.year,
    block: user.block,
  });

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const blocks = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setFormData({
      full_name: user.full_name,
      year: user.year,
      block: user.block,
    });
  };

  return (
    <div className="profile-card">
      <h2>User Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label className="label">Student Number:</label>
            <span className="value">{user.student_number}</span>
          </div>
          <div className="profile-field">
            <label className="label">Full Name:</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label className="label">Year:</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="profile-select"
              required
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="profile-field">
            <label className="label">Block:</label>
            <select
              name="block"
              value={formData.block}
              onChange={handleInputChange}
              className="profile-select"
              required
            >
              <option value="">Select Block</option>
              {blocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          <div className="profile-field">
            <label className="label">Email Address:</label>
            <span className="value">{user.email}</span>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              Save
            </button>
            <button type="button" className="btn-cancel" onClick={toggleEdit}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="profile-field">
            <span className="label">Student Number:</span>
            <span className="value">{user.student_number}</span>
          </div>
          <div className="profile-field">
            <span className="label">Full Name:</span>
            <span className="value">{user.full_name}</span>
          </div>
          <div className="profile-field">
            <span className="label">Year and Block:</span>
            <span className="value">{user.year} {user.block}</span>
          </div>
          <div className="profile-field">
            <span className="label">Email Address:</span>
            <span className="value">{user.email}</span>
          </div>
          <button className="btn-edit" onClick={toggleEdit}>
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileCard;